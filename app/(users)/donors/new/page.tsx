"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Layout } from "../../../../layout/layout.component";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Formik, useFormikContext } from "formik";
import axios from "axios";
import { $api } from "@/api";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";
import { medicalAnswersToQuestionnairePayload } from "@/lib/donors/questionnairePayload";
import { parseQuestionnaireResult } from "@/lib/donors/parseQuestionnaireResponse";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import {
  extractQuestionnaireResultFromProfile,
  isQuestionnaireAnswered,
} from "@/lib/donors/donorProfileGuards";
import type { DonorBloodType } from "@/types/donors";
import type { DonorQuestionnaireResult } from "@/types/donors";
import type { DonorLocationPoint } from "@/types/donors";

import { StepOne, type MedicalAnswers } from "../steps/one/step_one.component";
import {
  StepThree,
  type AppointmentDetails,
} from "../steps/three/step_three.component";
import {
  DonorBasicsStep,
  type DonorBasicsValues,
} from "../steps/basics/donor-basics-step.component";
import { NewDonorPageSkeleton } from "./new-donor-page-skeleton";

const STEP_PARAM_VALUES = ["basics", "health", "appointment"] as const;
type StepParam = (typeof STEP_PARAM_VALUES)[number];

function stepParamToNumber(param: string | null): number {
  const i = STEP_PARAM_VALUES.indexOf(param as StepParam);
  return i >= 0 ? i + 1 : 1;
}

function stepNumberToParam(step: number): StepParam {
  const i = Math.max(1, Math.min(step, 3)) - 1;
  return STEP_PARAM_VALUES[i];
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data;
    if (
      d &&
      typeof d === "object" &&
      "message" in d &&
      typeof (d as { message: unknown }).message === "string"
    ) {
      return (d as { message: string }).message;
    }
    return e.message || fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

const REQUIRED_MEDICAL_FIELDS = [
  "gender",
  "age_18_64",
  "weight_under_50kg",
  "organ_tissue_transplant",
  "injected_drugs_doping",
  "diabetes",
  "blood_transfusion",
  "chronic_condition",
  "hepatitis_b_vaccine",
] as const;

const STEPS = [
  { id: 1, label: "Blood type & location" },
  { id: 2, label: "Health questionnaire" },
  { id: 3, label: "Next steps" },
];

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav
      className="flex flex-col relative gap-2 mb-8 w-full "
      aria-label="Progress"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isPast = step.id < currentStep;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${isActive ? "flex" : "hidden sm:flex"}`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <div
                    className={`inline-flex items-center justify-center size-[13px] rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-primary text-white"
                        : isPast
                          ? "bg-primary"
                          : "bg-[#E5E7EB] text-text-tertiary"
                    }`}
                  />
                  <p className="text-xs font-medium text-[#6B7280]">
                    step {step.id}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${isActive ? "text-text-primary" : "text-text-tertiary"}`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="absolute bg-primary h-[3px] bottom-0 left-0 transition-all duration-700 ease-in-out hidden sm:block"
        style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
      />
      <div className="w-full h-[3px] bg-border hidden sm:block" />
    </nav>
  );
}

const initialBasics: DonorBasicsValues = {
  bloodType: "",
  country: "",
  state: "",
  postalCode: "",
  longitude: "",
  latitude: "",
};

const initialAppointment: AppointmentDetails = {
  hospitalId: "",
  date: "",
  time: "",
  agreeTerms: false,
  agreePrivacy: false,
};

interface NewDonorFormValues {
  basics: DonorBasicsValues;
  medical: MedicalAnswers;
  appointment: AppointmentDetails;
}

const initialValues: NewDonorFormValues = {
  basics: initialBasics,
  medical: {},
  appointment: initialAppointment,
};

function NewDonorForm() {
  const dispatch = useAppDispatch();
  const { values, setFieldValue } = useFormikContext<NewDonorFormValues>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  const [basicsComplete, setBasicsComplete] = useState(false);
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [questionnaireResult, setQuestionnaireResult] =
    useState<DonorQuestionnaireResult | null>(null);

  const [basicsError, setBasicsError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmittingQuestionnaire, setIsSubmittingQuestionnaire] =
    useState(false);
  const [hydrated, setHydrated] = useState(false);

  const requestedStep = useMemo(
    () => stepParamToNumber(searchParams.get("step")),
    [searchParams],
  );

  const handleBasicsChange = useCallback(
    (field: keyof DonorBasicsValues, value: string) => {
      void setFieldValue(`basics.${field}`, value);
    },
    [setFieldValue],
  );

  const handleMedicalChange = useCallback(
    (name: string, value: string) => {
      void setFieldValue(`medical.${name}`, value);
    },
    [setFieldValue],
  );

  const handleAppointmentChange = useCallback(
    <K extends keyof AppointmentDetails>(
      field: K,
      value: AppointmentDetails[K],
    ) => {
      void setFieldValue(`appointment.${field}`, value);
    },
    [setFieldValue],
  );

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const { data, status } = await $api.donors.me();
        if (cancelled || status < 200 || status >= 300 || !data) return;
        const raw = unwrapApiRecord(data);
        if (!raw) return;

        if (typeof raw.bloodType === "string" && raw.bloodType.length > 0) {
          setBasicsComplete(true);
          void setFieldValue("basics.bloodType", raw.bloodType);
          const coords = raw.location as
            | { coordinates?: [number, number] }
            | undefined;
          if (
            coords?.coordinates &&
            coords.coordinates.length === 2 &&
            Number.isFinite(coords.coordinates[0]) &&
            Number.isFinite(coords.coordinates[1])
          ) {
            void setFieldValue(
              "basics.longitude",
              String(coords.coordinates[0]),
            );
            void setFieldValue(
              "basics.latitude",
              String(coords.coordinates[1]),
            );
          }

          const country = raw.country ?? raw.countryCode;
          if (typeof country === "string" && country.length > 0) {
            void setFieldValue("basics.country", country);
          }
          if (typeof raw.state === "string" && raw.state.length > 0) {
            void setFieldValue("basics.state", raw.state);
          }
          const postal =
            raw.postalCode ?? raw.postal_code ?? raw.postcode;
          if (typeof postal === "string" && postal.length > 0) {
            void setFieldValue("basics.postalCode", postal);
          }
        }

        if (isQuestionnaireAnswered(raw)) {
          setQuestionnaireComplete(true);
          setQuestionnaireResult(extractQuestionnaireResultFromProfile(raw));
        }
      } catch {
        // No donor profile yet — user must complete step 1.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [setFieldValue]);

  const allMedicalAnswered = REQUIRED_MEDICAL_FIELDS.every((field) =>
    Boolean(values.medical[field]),
  );

  const maxAllowedStep = !basicsComplete
    ? 1
    : !questionnaireComplete
      ? 2
      : 3;
  const clampedStep = Math.min(requestedStep, maxAllowedStep);
  /** If the questionnaire is already done (from API), never keep the user on step 1 or 2. */
  const step =
    basicsComplete && questionnaireComplete && clampedStep < 3
      ? 3
      : clampedStep;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /**
   * Updates the URL step. Do not clamp with maxAllowedStep here — that value is
   * still stale in the same tick as setBasicsComplete / setQuestionnaireComplete,
   * which incorrectly kept step 2 after questionnaire submit. Visibility is
   * still limited by `step = Math.min(requestedStep, maxAllowedStep)`.
   */
  const setStepParam = useCallback(
    (newStep: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", stepNumberToParam(newStep));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!hydrated) return;
    const currentParam = searchParams.get("step");
    const normalizedParam = stepNumberToParam(step);

    if (currentParam !== normalizedParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", normalizedParam);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [hydrated, pathname, router, searchParams, step]);

  function buildLocation(): DonorLocationPoint | undefined | "invalid" {
    const lngStr = values.basics.longitude.trim();
    const latStr = values.basics.latitude.trim();
    if (lngStr === "" && latStr === "") return undefined;
    if (lngStr === "" || latStr === "") {
      setBasicsError("Enter both longitude and latitude, or leave both empty.");
      return "invalid";
    }
    const lng = Number.parseFloat(lngStr);
    const lat = Number.parseFloat(latStr);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      setBasicsError("Invalid coordinates.");
      return "invalid";
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      setBasicsError("Coordinates out of range.");
      return "invalid";
    }
    return { type: "Point", coordinates: [lng, lat] };
  }

  const handleRegisterBasics = async () => {
    setBasicsError(null);
    if (!values.basics.bloodType) {
      setBasicsError("Select a blood type.");
      return;
    }
    const loc = buildLocation();
    if (loc === "invalid") return;

    setIsRegistering(true);
    try {
      const payload: {
        bloodType: DonorBloodType;
        location?: DonorLocationPoint;
      } = {
        bloodType: values.basics.bloodType as DonorBloodType,
        ...(loc ? { location: loc } : {}),
      };

      const { status } = await $api.donors.register(payload);
      if (status >= 200 && status < 300) {
        setBasicsComplete(true);
        setStepParam(2);
      } else {
        setBasicsError("Could not save donor profile. Try again.");
      }
    } catch (e) {
      setBasicsError(
        getErrorMessage(e, "Could not save donor profile. Try again."),
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmitQuestionnaire = async () => {
    setHealthError(null);
    if (questionnaireComplete) {
      setStepParam(3);
      return;
    }
    if (!allMedicalAnswered) return;

    setIsSubmittingQuestionnaire(true);
    try {
      const body = medicalAnswersToQuestionnairePayload(values.medical);
      const { status, data } = await $api.donors.questionnaire(body);
      if (status >= 200 && status < 300) {
        const parsed = parseQuestionnaireResult(data);
        setQuestionnaireResult(parsed);
        setQuestionnaireComplete(true);
        setStepParam(3);

        try {
          const me = await $api.auth.me();
          if (me.status >= 200 && me.status < 300 && me.data) {
            const userPayload = normalizeUser(me.data);
            if (userPayload) dispatch(setUser(userPayload));
          }
        } catch {
          // ignore refresh failure
        }
      } else {
        setHealthError("Questionnaire could not be submitted.");
      }
    } catch (e) {
      setHealthError(
        getErrorMessage(
          e,
          "Questionnaire could not be submitted. It may already have been submitted.",
        ),
      );
    } finally {
      setIsSubmittingQuestionnaire(false);
    }
  };

  const canConfirmAppointment = Boolean(
    values.appointment.hospitalId &&
      values.appointment.date &&
      values.appointment.time &&
      values.appointment.agreeTerms &&
      values.appointment.agreePrivacy,
  );

  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirmAppointment) return;
    // Scheduling is separate from donor API; integrate when booking endpoint is wired.
  };

  if (!hydrated) {
    return <NewDonorPageSkeleton />;
  }

  return (
    <div className="sm:p-6 w-full flex flex-col  flex-1 h-full grow">
      <StepProgress currentStep={step} />
      <div
        ref={contentRef}
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
      >
        <DonorBasicsStep
          active={step === 1}
          values={values.basics}
          onChange={handleBasicsChange}
          onSubmit={handleRegisterBasics}
          isSubmitting={isRegistering}
          error={basicsError}
        />
        <StepOne
          active={step === 2}
          medical={values.medical}
          handleMedicalChange={handleMedicalChange}
          onSubmitQuestionnaire={handleSubmitQuestionnaire}
          isSubmitting={isSubmittingQuestionnaire}
          submitError={healthError}
        />
        <StepThree
          active={step === 3}
          appointment={values.appointment}
          handleAppointmentChange={handleAppointmentChange}
          canConfirm={canConfirmAppointment}
          onConfirm={handleConfirmAppointment}
          eligibility={questionnaireResult}
        />
      </div>
    </div>
  );
}

function NewDonorContent() {
  return (
    <Formik<NewDonorFormValues>
      initialValues={initialValues}
      onSubmit={() => {}}
    >
      <NewDonorForm />
    </Formik>
  );
}

export default function NewDonor() {
  return (
    <Layout>
      <Suspense fallback={<NewDonorPageSkeleton />}>
        <NewDonorContent />
      </Suspense>
    </Layout>
  );
}
