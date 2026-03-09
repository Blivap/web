"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Layout } from "../../components/layout/layout.component";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Formik, useFormikContext } from "formik";

const STEP_PARAM_VALUES = ["medical", "data", "appointment"] as const;
type StepParam = (typeof STEP_PARAM_VALUES)[number];

function stepParamToNumber(param: string | null): number {
  const i = STEP_PARAM_VALUES.indexOf(param as StepParam);
  return i >= 0 ? i + 1 : 1;
}

function stepNumberToParam(step: number): StepParam {
  const i = Math.max(1, Math.min(step, 3)) - 1;
  return STEP_PARAM_VALUES[i];
}
import { StepOne, type MedicalAnswers } from "../steps/one/step_one.component";
import { StepTwo, type PersonalDetails } from "../steps/two/step_two.component";
import {
  StepThree,
  type AppointmentDetails,
} from "../steps/three/step_three.component";

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
  { id: 1, label: "Medical questions" },
  { id: 2, label: "Personal data" },
  { id: 3, label: "Make an appointment" },
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

const initialPersonal: PersonalDetails = {
  gender: "",
  fullName: "",
  dateOfBirth: "",
  correspondenceName: "",
  email: "",
  countryResidence: "",
  postalCode: "",
  houseNumber: "",
  address: "",
  streetName: "",
  placeOfResidence: "",
  phoneNumber: "",
};

const initialAppointment: AppointmentDetails = {
  hospitalId: "",
  date: "",
  time: "",
  agreeTerms: false,
  agreePrivacy: false,
};

interface NewDonorFormValues {
  medical: MedicalAnswers;
  personal: PersonalDetails;
  appointment: AppointmentDetails;
}

const initialValues: NewDonorFormValues = {
  medical: {},
  personal: initialPersonal,
  appointment: initialAppointment,
};

function NewDonorForm() {
  const { values, setFieldValue } = useFormikContext<NewDonorFormValues>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const requestedStep = useMemo(
    () => stepParamToNumber(searchParams.get("step")),
    [searchParams],
  );

  const handleMedicalChange = (name: string, value: string) => {
    void setFieldValue(`medical.${name}`, value);
  };

  const handlePersonalChange = (
    field: keyof PersonalDetails,
    value: string,
  ) => {
    void setFieldValue(`personal.${field}`, value);
  };

  const personalRequired = [
    values.personal.gender,
    values.personal.fullName,
    values.personal.dateOfBirth,
    values.personal.email,
    values.personal.countryResidence,
    values.personal.houseNumber,
    values.personal.streetName,
    values.personal.placeOfResidence,
    values.personal.phoneNumber,
  ];
  const allMedicalAnswered = REQUIRED_MEDICAL_FIELDS.every((field) =>
    Boolean(values.medical[field]),
  );
  const allPersonalRequired = personalRequired.every(Boolean);
  const maxAllowedStep = allMedicalAnswered ? (allPersonalRequired ? 3 : 2) : 1;
  const step = Math.min(requestedStep, maxAllowedStep);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const setStepParam = (newStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", stepNumberToParam(Math.min(newStep, maxAllowedStep)));
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const currentParam = searchParams.get("step");
    const normalizedParam = stepNumberToParam(step);

    if (currentParam !== normalizedParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", normalizedParam);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pathname, router, searchParams, step]);

  const handleAppointmentChange = <K extends keyof AppointmentDetails>(
    field: K,
    value: AppointmentDetails[K],
  ) => {
    void setFieldValue(`appointment.${field}`, value);
  };

  const handleContinue = () => {
    if (step === 1) setStepParam(2);
    if (step === 2 && allPersonalRequired) setStepParam(3);
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
    // TODO: submit full donor registration
  };

  return (
    <div className="sm:p-6 w-full flex flex-col  flex-1 h-full grow">
      <StepProgress currentStep={step} />
      <div
        ref={contentRef}
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
      >
        <StepOne
          active={step === 1}
          medical={values.medical}
          handleContinue={handleContinue}
          handleMedicalChange={handleMedicalChange}
        />
        <StepTwo
          active={step === 2}
          personal={values.personal}
          handlePersonalChange={handlePersonalChange}
          allPersonalRequired={allPersonalRequired}
          handleContinue={handleContinue}
        />
        <StepThree
          active={step === 3}
          appointment={values.appointment}
          handleAppointmentChange={handleAppointmentChange}
          canConfirm={canConfirmAppointment}
          onConfirm={handleConfirmAppointment}
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
      <Suspense
        fallback={
          <div className="p-6 text-sm text-text-secondary">Loading…</div>
        }
      >
        <NewDonorContent />
      </Suspense>
    </Layout>
  );
}
