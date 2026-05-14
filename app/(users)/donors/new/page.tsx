"use client";

import { AuthLoader } from "@/components/auth/auth-loader.component";
import { useDonorsNewPageGate } from "@/hooks/donors/useDonorsNewPageGate.hook";
import { navigateOutAfterSuccess } from "@/lib/navigation/navigateOutAfterSuccess";
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
  DonorScreeningProfilePayload,
} from "@/types/donors";
import {
  extractScreeningProfileFromDonor,
  hasScreeningProfileOnRecord,
} from "@/lib/donors/extractScreeningProfileFromDonor";
import { normalizeDonationTypeForApi } from "@/lib/donors/screeningDonationTypes";

import { StepOne, type MedicalAnswers } from "../steps/one/step_one.component";
import { StepThree } from "../steps/three/step_three.component";
import { DonorScreeningProfileStep } from "../steps/screening/donor-screening-profile-step.component";
import { DonorAiQuestionnairePanel } from "../steps/screening/donor-ai-questionnaire-panel.component";
import {
  DonorBasicsStep,
  type DonorBasicsValues,
} from "../steps/basics/donor-basics-step.component";
import { DonorRegistrationSuccessModal } from "./donor-registration-success-modal.component";
import { NewDonorPageSkeleton } from "./new-donor-page-skeleton";
import { normalizeDonorRegistrationType } from "./donor-registration-type";
import { ReproductiveDonorFlow } from "./reproductive-donor-flow.component";

type AreaLocationPayload = {
  country: string;
  state: string;
  city: string;
  area: string;
};

const STEP_PARAM_VALUES = [
  "basics",
  "screening",
  "health",
  "activation",
] as const;
type StepParam = (typeof STEP_PARAM_VALUES)[number];

function stepParamToNumber(param: string | null): number {
  if (!param) return 1;
  const i = STEP_PARAM_VALUES.indexOf(param as StepParam);
  if (i >= 0) return i + 1;
  /** Legacy URLs only had three steps — map old “health” to legacy questionnaire (now step 3). */
  if (param === "health") return 3;
  if (param === "activation") return 4;
  return 1;
}

function stepNumberToParam(step: number): StepParam {
  const i = Math.max(1, Math.min(step, 4)) - 1;
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
  { id: 2, label: "Screening profile" },
  { id: 3, label: "Legacy health questionnaire" },
  { id: 4, label: "Activation" },
];

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav
      className="flex flex-col relative gap-2 mb-8 w-full "
      aria-label="Progress"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 w-full">
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

  const donationTypeFromQuery = useMemo(
    () => searchParams.get("donationType")?.trim() || null,
    [searchParams],
  );

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
  const [screeningStepResolved, setScreeningStepResolved] = useState(false);
  const [screeningServerDefaults, setScreeningServerDefaults] =
    useState<DonorScreeningProfilePayload>({});
  const [screeningSaveError, setScreeningSaveError] = useState<string | null>(
    null,
  );
  const [isSavingScreening, setIsSavingScreening] = useState(false);
  const [primaryDonationTypeForAi, setPrimaryDonationTypeForAi] =
    useState("whole_blood");

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
          setScreeningStepResolved(true);
        }

        const screeningPayload = extractScreeningProfileFromDonor(raw);
        setScreeningServerDefaults(screeningPayload);
        if (hasScreeningProfileOnRecord(raw)) {
          setScreeningStepResolved(true);
        }
        const types = screeningPayload.activeDonationTypes;
        if (types && types.length > 0) {
          setPrimaryDonationTypeForAi(normalizeDonationTypeForApi(types[0]));
        } else if (donationTypeFromQuery) {
          setPrimaryDonationTypeForAi(
            normalizeDonationTypeForApi(donationTypeFromQuery),
          );
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
  }, [donationTypeFromQuery, setFieldValue]);

  const allMedicalAnswered = REQUIRED_MEDICAL_FIELDS.every((field) =>
    Boolean(values.medical[field]),
  );

  const requiredStep = !basicsComplete
    ? 1
    : !screeningStepResolved
      ? 2
      : !questionnaireComplete
        ? 3
        : 4;
  const maxAllowedStep = requiredStep;
  const step = Math.min(requestedStep, maxAllowedStep);

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

  const handleScreeningSave = async (payload: DonorScreeningProfilePayload) => {
    setScreeningSaveError(null);
    setIsSavingScreening(true);
    try {
      const { status } = await $api.donors.patchScreeningProfile(payload);
      if (status >= 200 && status < 300) {
        setScreeningServerDefaults((prev) => ({ ...prev, ...payload }));
        setScreeningStepResolved(true);
        const primary = payload.activeDonationTypes?.[0];
        if (primary) setPrimaryDonationTypeForAi(normalizeDonationTypeForApi(primary));
        setStepParam(3);
      } else {
        setScreeningSaveError("Could not save screening profile.");
      }
    } catch (e) {
      setScreeningSaveError(
        getErrorMessage(e, "Could not save screening profile."),
      );
    } finally {
      setIsSavingScreening(false);
    }
  };

  const handleScreeningSkip = () => {
    setScreeningSaveError(null);
    setScreeningStepResolved(true);
    setStepParam(3);
  };

  const handleSubmitQuestionnaire = async () => {
    setHealthError(null);
    if (questionnaireComplete && !retakeUnlocked) {
      setStepParam(4);
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
        setStepParam(4);

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
      setActivationRequestError(
        "Complete the legacy health questionnaire first.",
      );
      setStepParam(3);
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col px-4 pb-6 pt-4 sm:p-6">
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
        <DonorScreeningProfileStep
          active={step === 2}
          serverDefaults={screeningServerDefaults}
          urlPrimaryDonationTypeHint={donationTypeFromQuery}
          onSave={handleScreeningSave}
          onSkip={handleScreeningSkip}
          onBack={() => setStepParam(1)}
          isSaving={isSavingScreening}
          error={screeningSaveError}
        />
        <StepOne
          active={step === 3}
          medical={values.medical}
          handleMedicalChange={handleMedicalChange}
          onSubmitQuestionnaire={handleSubmitQuestionnaire}
          onBack={() => setStepParam(2)}
          isSubmitting={isSubmittingQuestionnaire}
          submitError={healthError}
          editable={!questionnaireComplete || retakeUnlocked}
          completed={questionnaireComplete}
        />
        <StepThree
          active={step === 4}
          onSendRequest={handleRequestActivation}
          onRequestRetake={handleRequestRetake}
          onBack={() => setStepParam(3)}
          isSendingRequest={isRequestingActivation}
          requestError={activationRequestError}
          eligibility={questionnaireResult}
          optionalContent={
            <DonorAiQuestionnairePanel
              primaryDonationType={primaryDonationTypeForAi}
            />
          }
        />
      </div>
      <DonorRegistrationSuccessModal
        open={isActivationSuccessModalOpen}
        onClose={() => setIsActivationSuccessModalOpen(false)}
        onContinue={() => {
          setIsActivationSuccessModalOpen(false);
          queueMicrotask(() => navigateOutAfterSuccess(router));
        }}
        eyebrow="Blood donor registration"
        title="Your activation request is now in review"
        description="Your blood donor profile, screening preferences, legacy health questionnaire, and activation request are on file. Typed screening does not replace the activation gate — our team continues verification from the legacy path."
        highlights={[
          {
            title: "Medical review",
            description:
              "Legacy questionnaire answers and donor details are checked for blood booking eligibility and completeness.",
          },
          {
            title: "Verification progress",
            description:
              "Optional screening profile and typed questionnaires improve matching and your public card; they do not replace activation rules.",
          },
          {
            title: "Overview updates",
            description:
              "Return to overview to keep using your account while this donor request is being processed.",
          },
        ]}
        footerNote="You do not need to stay on this page while the activation request is being reviewed."
      />
    </div>
  );
}

function NewDonorContent() {
  const searchParams = useSearchParams();
  const donorType = normalizeDonorRegistrationType(searchParams.get("type"));

  if (donorType !== "blood") {
    return <ReproductiveDonorFlow donorType={donorType} />;
  }

  return (
    <Formik<NewDonorFormValues>
      initialValues={initialValues}
      onSubmit={() => {}}
    >
      <NewDonorForm />
    </Formik>
  );
}

function NewDonorPageWithGate() {
  const { showGateLoader } = useDonorsNewPageGate();

  if (showGateLoader) {
    return (
      <Layout>
        <AuthLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <NewDonorContent />
    </Layout>
  );
}

export default function NewDonor() {
  return (
    <Suspense
      fallback={
        <Layout>
          <NewDonorPageSkeleton />
        </Layout>
      }
    >
      <NewDonorPageWithGate />
    </Suspense>
  );
}
