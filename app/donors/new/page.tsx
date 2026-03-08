"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Layout } from "../../components/layout/layout.component";
import { Suspense, useState, useEffect, useMemo } from "react";

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

const TYPE_LABELS: Record<string, string> = {
  blood: "Blood donor",
  sperm: "Sperm donor",
  ovary: "Ovary donor",
};

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

function NewDonorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const type = searchParams.get("type") ?? "blood";
  const label = TYPE_LABELS[type] ?? TYPE_LABELS.blood;

  const step = useMemo(
    () => stepParamToNumber(searchParams.get("step")),
    [searchParams],
  );

  const setStepParam = (newStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", stepNumberToParam(newStep));
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (searchParams.get("step") == null) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", "medical");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pathname, router, searchParams]);

  const [medical, setMedical] = useState<MedicalAnswers>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const [personal, setPersonal] = useState<PersonalDetails>(initialPersonal);
  const [appointment, setAppointment] =
    useState<AppointmentDetails>(initialAppointment);

  const handleMedicalChange = (name: string, value: string) => {
    setMedical((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalChange = (
    field: keyof PersonalDetails,
    value: string,
  ) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  };

  const personalRequired = [
    personal.gender,
    personal.fullName,
    personal.dateOfBirth,
    personal.email,
    personal.countryResidence,
    personal.houseNumber,
    personal.streetName,
    personal.placeOfResidence,
    personal.phoneNumber,
  ];
  const allPersonalRequired = personalRequired.every(Boolean);

  const handleAppointmentChange = <K extends keyof AppointmentDetails>(
    field: K,
    value: AppointmentDetails[K],
  ) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (step === 1) setStepParam(2);
    if (step === 2 && allPersonalRequired) setStepParam(3);
  };

  const canConfirmAppointment = Boolean(
    appointment.hospitalId &&
    appointment.date &&
    appointment.time &&
    appointment.agreeTerms &&
    appointment.agreePrivacy,
  );

  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirmAppointment) return;
    // TODO: submit full donor registration
  };

  return (
    <div className="sm:p-6 w-full">
      <StepProgress currentStep={step} />

      <StepOne
        active={step === 1}
        medical={medical}
        handleContinue={handleContinue}
        handleMedicalChange={handleMedicalChange}
      />
      <StepTwo
        active={step === 2}
        personal={personal}
        handlePersonalChange={handlePersonalChange}
        allPersonalRequired={allPersonalRequired}
        handleContinue={handleContinue}
      />
      <StepThree
        active={step === 3}
        appointment={appointment}
        handleAppointmentChange={handleAppointmentChange}
        canConfirm={canConfirmAppointment}
        onConfirm={handleConfirmAppointment}
      />
    </div>
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
