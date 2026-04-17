"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Layout } from "../../../../layout/layout.component";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Formik, useFormikContext } from "formik";
import axios from "axios";
import { $api } from "@/app/api";
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
import type {
  DonorBloodType,
  DonorQuestionnaireResult,
  DonorRegisterPayload,
} from "@/types/donors";

import { StepOne, type MedicalAnswers } from "../steps/one/step_one.component";
import { StepThree } from "../steps/three/step_three.component";
import {
  DonorBasicsStep,
  type DonorBasicsValues,
} from "../steps/basics/donor-basics-step.component";
import { NewDonorPageSkeleton } from "./new-donor-page-skeleton";
import { Modal } from "@/components/ui/modal/modal.component";
import { Button } from "@/components/button/button.component";
import { routes } from "@/config/routes";

type AreaLocationPayload = {
  country: string;
  state: string;
  city: string;
  area: string;
};

const STEP_PARAM_VALUES = ["basics", "health", "activation"] as const;
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

function sanitizeLocationString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeAreaLocation(
  raw: Record<string, unknown>,
): AreaLocationPayload | null {
  const source =
    raw.areaLocation && typeof raw.areaLocation === "object"
      ? (raw.areaLocation as Record<string, unknown>)
      : raw;

  const country = sanitizeLocationString(source.country ?? source.countryCode);
  const state = sanitizeLocationString(source.state);
  const city = sanitizeLocationString(source.city);
  const area = sanitizeLocationString(
    source.area ?? source.district ?? source.neighborhood,
  );

  if (!country || !state || !city || !area) return null;
  return {
    country,
    state,
    city,
    area,
  };
}

function normalizeAreaLocationFromBasics(
  basics: DonorBasicsValues,
): AreaLocationPayload | null {
  return normalizeAreaLocation({
    country: basics.country,
    state: basics.state,
    city: basics.city,
    area: basics.area,
  });
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
type RequiredMedicalField = (typeof REQUIRED_MEDICAL_FIELDS)[number];

const MEDICAL_FIELD_SOURCE_KEYS: Record<RequiredMedicalField, string[]> = {
  gender: ["gender"],
  age_18_64: ["age18to64", "age_18_64"],
  weight_under_50kg: ["weightUnder50kg", "weight_under_50kg"],
  organ_tissue_transplant: [
    "organOrTissueTransplant",
    "organ_tissue_transplant",
    "organOrTissueTransplanted",
  ],
  injected_drugs_doping: ["injectedDrugsOrDoping", "injected_drugs_doping"],
  diabetes: ["diabetes"],
  blood_transfusion: ["bloodProductsOrTransfusion", "blood_transfusion"],
  chronic_condition: ["chronicOrSeriousCondition", "chronic_condition"],
  hepatitis_b_vaccine: [
    "hepatitisBVaccineLast2Weeks",
    "hepatitis_b_vaccine",
    "hepatitis_b_vaccine_last_2_weeks",
  ],
};

function boolToYesNo(value: unknown): string {
  if (value === true || value === "true" || value === "yes") return "yes";
  if (value === false || value === "false" || value === "no") return "no";
  return "";
}

function getNestedRecord(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = raw[key];
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function extractMedicalAnswersFromProfile(
  raw: Record<string, unknown>,
): MedicalAnswers {
  const questionnaire =
    getNestedRecord(raw, "questionnaire") ?? getNestedRecord(raw, "answers");
  const questionnaireAnswers =
    getNestedRecord(raw, "questionnaireAnswers") ??
    getNestedRecord(raw, "questionnaire_answers");

  const sources: Record<string, unknown>[] = [raw];
  if (questionnaire) sources.push(questionnaire);
  if (questionnaireAnswers) sources.push(questionnaireAnswers);

  const result: MedicalAnswers = {};
  for (const field of REQUIRED_MEDICAL_FIELDS) {
    const sourceKeys = MEDICAL_FIELD_SOURCE_KEYS[field];
    if (field === "gender") {
      let gender = "";
      for (const source of sources) {
        for (const key of sourceKeys) {
          if (typeof source[key] === "string" && source[key]) {
            gender = String(source[key]);
            break;
          }
        }
        if (gender) break;
      }
      if (gender) result[field] = gender;
      continue;
    }

    let normalized = "";
    for (const source of sources) {
      for (const key of sourceKeys) {
        normalized = boolToYesNo(source[key]);
        if (normalized) break;
      }
      if (normalized) break;
    }
    if (normalized) result[field] = normalized;
  }

  return result;
}

function isRetakeRescheduled(raw: Record<string, unknown>): boolean {
  const truthy = (v: unknown) => v === true || v === "true";
  const asLower = (v: unknown) =>
    typeof v === "string" ? v.trim().toLowerCase() : "";

  if (truthy(raw.retakeRescheduled)) return true;
  if (truthy(raw.isRetakeRescheduled)) return true;
  if (truthy(raw.retake_rescheduled)) return true;
  if (truthy(raw.retakeScheduled)) return true;
  if (truthy(raw.retake_scheduled)) return true;

  const retakeStatus = asLower(raw.retakeStatus ?? raw.retake_status);
  if (retakeStatus === "rescheduled" || retakeStatus === "scheduled") {
    return true;
  }

  const requestStatus = asLower(
    raw.retakeRequestStatus ?? raw.retake_request_status,
  );
  if (requestStatus === "rescheduled" || requestStatus === "scheduled") {
    return true;
  }

  if (typeof raw.retakeScheduledAt === "string" && raw.retakeScheduledAt) {
    return true;
  }
  if (typeof raw.retake_scheduled_at === "string" && raw.retake_scheduled_at) {
    return true;
  }

  return false;
}

const STEPS = [
  { id: 1, label: "Blood type & location" },
  { id: 2, label: "Health questionnaire" },
  { id: 3, label: "Activation" },
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
  city: "",
  area: "",
};

interface NewDonorFormValues {
  basics: DonorBasicsValues;
  medical: MedicalAnswers;
}

const initialValues: NewDonorFormValues = {
  basics: initialBasics,
  medical: {},
};

function NewDonorForm() {
  const dispatch = useAppDispatch();
  const { values, setFieldValue } = useFormikContext<NewDonorFormValues>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const hasAutoRoutedToRequiredStep = useRef(false);

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

  const [isRequestingActivation, setIsRequestingActivation] = useState(false);
  const [activationRequestError, setActivationRequestError] = useState<
    string | null
  >(null);
  const [isActivationSuccessModalOpen, setIsActivationSuccessModalOpen] =
    useState(false);
  const [parsedAreaLocation, setParsedAreaLocation] =
    useState<AreaLocationPayload | null>(null);
  const [retakeUnlocked, setRetakeUnlocked] = useState(false);

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
          const savedArea = normalizeAreaLocation(raw);
          if (savedArea) {
            setParsedAreaLocation(savedArea);
            void setFieldValue("basics.country", savedArea.country);
            void setFieldValue("basics.state", savedArea.state);
            void setFieldValue("basics.city", savedArea.city);
            void setFieldValue("basics.area", savedArea.area);
          }
        }

        if (isQuestionnaireAnswered(raw)) {
          setQuestionnaireComplete(true);
          setQuestionnaireResult(extractQuestionnaireResultFromProfile(raw));
          const medical = extractMedicalAnswersFromProfile(raw);
          for (const [name, value] of Object.entries(medical)) {
            void setFieldValue(`medical.${name}`, value);
          }
        }

        setRetakeUnlocked(isRetakeRescheduled(raw));
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

  const requiredStep = !basicsComplete ? 1 : !questionnaireComplete ? 2 : 3;
  const step = Math.min(requestedStep, 3);

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
    if (!hydrated || hasAutoRoutedToRequiredStep.current) return;

    hasAutoRoutedToRequiredStep.current = true;
    if (requestedStep === requiredStep) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("step", stepNumberToParam(requiredStep));
    router.replace(`${pathname}?${params.toString()}`);
  }, [hydrated, pathname, requestedStep, requiredStep, router, searchParams]);

  const handleRegisterBasics = async () => {
    setBasicsError(null);
    if (basicsComplete && !retakeUnlocked) {
      setStepParam(2);
      return;
    }
    if (!values.basics.bloodType) {
      setBasicsError("Select a blood type.");
      return;
    }
    if (!values.basics.country.trim()) {
      setBasicsError("Select your country.");
      return;
    }
    if (!values.basics.state.trim()) {
      setBasicsError("Enter your state/region.");
      return;
    }
    if (!values.basics.area.trim()) {
      setBasicsError("Enter your area.");
      return;
    }
    if (!values.basics.city.trim()) {
      setBasicsError("Enter your city/town.");
      return;
    }
    const parsed = normalizeAreaLocationFromBasics(values.basics);
    if (!parsed) {
      setBasicsError(
        "Location details are invalid. Please review country, state, city, and area.",
      );
      return;
    }

    setIsRegistering(true);
    try {
      const payload: DonorRegisterPayload = {
        bloodType: values.basics.bloodType as DonorBloodType,
        areaLocation: parsed,
      };

      const { status } = await $api.donors.register(payload);
      if (status >= 200 && status < 300) {
        setParsedAreaLocation(parsed);
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
    if (questionnaireComplete && !retakeUnlocked) {
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

  const handleRequestActivation = async () => {
    setActivationRequestError(null);
    if (!basicsComplete) {
      setActivationRequestError(
        "Complete step 1 with blood type and location details first.",
      );
      setStepParam(1);
      return;
    }
    if (!questionnaireComplete) {
      setActivationRequestError("Complete the health questionnaire first.");
      setStepParam(2);
      return;
    }
    let areaLocation: AreaLocationPayload | null =
      normalizeAreaLocationFromBasics(values.basics) ?? parsedAreaLocation;

    // If current form is missing fields, fallback to saved donor profile location.
    if (!areaLocation) {
      try {
        const me = await $api.donors.me();
        const raw = me.data ? unwrapApiRecord(me.data) : null;
        if (me.status >= 200 && me.status < 300 && raw) {
          areaLocation = normalizeAreaLocation(raw);
          if (areaLocation) {
            void setFieldValue("basics.country", areaLocation.country);
            void setFieldValue("basics.state", areaLocation.state);
            void setFieldValue("basics.city", areaLocation.city);
            void setFieldValue("basics.area", areaLocation.area);
          }
        }
      } catch {
        // handled by validation message below
      }
    }

    if (!areaLocation) {
      setActivationRequestError(
        "Area location is required for donor matching. Complete step 1 first.",
      );
      setStepParam(1);
      return;
    }

    setIsRequestingActivation(true);
    try {
      const { status, error, message } = await $api.donors.requestActivation({
        areaLocation,
      });
      if (status >= 200 && status < 300) {
        setIsActivationSuccessModalOpen(true);
        return;
      }
      setActivationRequestError(
        error ?? message ?? "Could not submit activation request.",
      );
    } catch (e) {
      setActivationRequestError(
        getErrorMessage(e, "Could not submit activation request."),
      );
    } finally {
      setIsRequestingActivation(false);
    }
  };

  const handleRequestRetake = async () => {
    setActivationRequestError(null);
    setIsRequestingActivation(true);
    try {
      const { status, error, message } = await $api.donors.requestRetake();
      if (status >= 200 && status < 300) {
        setIsActivationSuccessModalOpen(true);
        return;
      }
      setActivationRequestError(
        error ?? message ?? "Could not request retake.",
      );
    } catch (e) {
      setActivationRequestError(
        getErrorMessage(e, "Could not request retake."),
      );
    } finally {
      setIsRequestingActivation(false);
    }
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
          editable={!basicsComplete || retakeUnlocked}
          completed={basicsComplete}
        />
        <StepOne
          active={step === 2}
          medical={values.medical}
          handleMedicalChange={handleMedicalChange}
          onSubmitQuestionnaire={handleSubmitQuestionnaire}
          onBack={() => setStepParam(1)}
          isSubmitting={isSubmittingQuestionnaire}
          submitError={healthError}
          editable={!questionnaireComplete || retakeUnlocked}
          completed={questionnaireComplete}
        />
        <StepThree
          active={step === 3}
          onSendRequest={handleRequestActivation}
          onRequestRetake={handleRequestRetake}
          onBack={() => setStepParam(2)}
          isSendingRequest={isRequestingActivation}
          requestError={activationRequestError}
          eligibility={questionnaireResult}
        />
      </div>
      <Modal
        open={isActivationSuccessModalOpen}
        onClose={() => setIsActivationSuccessModalOpen(false)}
      >
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-lg font-semibold text-primary text-center">
            Verification is processing
          </h3>
          <p className="text-sm text-center text-[#4B5563] dark:text-white/70">
            Your donor activation request has been submitted. We are now
            processing your verification request.
          </p>
          <div className="flex justify-center pt-1">
            <Button
              onClick={() => {
                setIsActivationSuccessModalOpen(false);
                router.replace(routes.overview);
              }}
              className="rounded-md! px-5 py-2"
            >
              Continue to overview
            </Button>
          </div>
        </div>
      </Modal>
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
