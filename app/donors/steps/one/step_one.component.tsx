"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Radio } from "@/components/forms/Radio";

export type MedicalAnswers = Record<string, string>;

export interface StepOneProps {
  medical: MedicalAnswers;
  handleContinue: () => void;
  handleMedicalChange: (name: string, value: string) => void;
  active: boolean;
}

const MEDICAL_QUESTIONS: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    name: "gender",
    label: "What is your gender?",
    options: [
      { value: "man", label: "Man" },
      { value: "woman", label: "Woman" },
    ],
  },
  {
    name: "age_18_64",
    label: "Are you between 18 and 64 years old?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "weight_under_50kg",
    label: "Do you weigh less than 50 kg?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "organ_tissue_transplant",
    label: "Have you ever had an organ or tissue transplant?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "injected_drugs_doping",
    label: "Have you ever injected drugs or doping?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "diabetes",
    label: "Do you have diabetes?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "blood_transfusion",
    label: "Have you had products or a blood transfusion?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "chronic_condition",
    label:
      "Do you have a chronic or serious condition (or have you had one in the past)?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    name: "hepatitis_b_vaccine",
    label:
      "Have you received a preventative vaccine in the past 2 weeks to prevent hepatitis B?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

const QUESTION_TOOLTIPS: Record<string, string> = {
  gender:
    "We use this to apply eligibility criteria that may differ by gender (e.g. haemoglobin thresholds).",
  age_18_64:
    "Donors must be 18–64 years old for their own safety and that of recipients.",
  weight_under_50kg: "Donors under 50 kg may not donate for safety reasons.",
  organ_tissue_transplant:
    "Having received an organ or tissue transplant can affect eligibility.",
  injected_drugs_doping:
    "History of injected drugs or doping may permanently defer you from donating.",
  diabetes:
    "Some people with diabetes can donate; we need to know to assess eligibility.",
  blood_transfusion:
    "If you have had a blood transfusion we need to know for safety screening.",
  chronic_condition:
    "Chronic or serious conditions may affect whether it is safe for you to donate.",
  hepatitis_b_vaccine:
    "Recent hepatitis B vaccine can temporarily affect donation eligibility.",
};

function FirstStepQuestionRow({
  name,
  label,
  options,
  value,
  onChange,
  tooltip,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const idBase = `medical-${name}`;
  const tooltipText = tooltip ?? `More information about: ${label}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2">
        <label htmlFor={`${idBase}-0`} className="text-sm text-balck ">
          {label}
        </label>
        <div
          className="relative shrink-0"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            type="button"
            className="w-4 h-4 rounded-full flex items-center justify-center text-primary hover:text-primary/70 transition-colors"
            aria-label={`More info about ${label}`}
          >
            <Info size={16} />
          </button>
          {showTooltip && tooltipText && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-1 sm:px-3 py-2 text-[10px] sm:text-xs text-white bg-foundation-dark rounded-lg shadow-lg w-[140px] max-w-[240px] whitespace-normal z-50"
              role="tooltip"
            >
              {tooltipText}
              <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-foundation-dark" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-[10px]">
        {options.map((opt, i) => (
          <Radio
            key={opt.value}
            id={`${idBase}-${i}`}
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            labelClassName="text-xs text-text-primary"
          >
            {opt.label}
          </Radio>
        ))}
      </div>
    </div>
  );
}

export function StepOne({
  medical,
  handleContinue,
  handleMedicalChange,
  active,
}: StepOneProps) {
  const allMedicalAnswered = MEDICAL_QUESTIONS.every((q) => medical[q.name]);

  return (
    active && (
      <>
        <h2 className="text-lg font-semibold text-text-primary mb-2 mt-6 xl:mt-15">
          Medical questions
        </h2>
        <p className="text-sm text-text-secondary mb-1 max-w-[600px]">
          Before you can become a blood donor, we&apos;ll ask you a few medical
          questions. This is to ensure it&apos;s safe for you and the recipient
          of your blood to donate.
        </p>
        <p className="text-sm text-text-secondary mb-1 mt-16">
          Please complete the questions below.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="flex flex-col gap-6"
        >
          {MEDICAL_QUESTIONS.map((q) => (
            <FirstStepQuestionRow
              key={q.name}
              name={q.name}
              label={q.label}
              options={q.options}
              value={medical[q.name] ?? ""}
              onChange={(value) => handleMedicalChange(q.name, value)}
              tooltip={QUESTION_TOOLTIPS[q.name]}
            />
          ))}

          <button
            type="submit"
            disabled={!allMedicalAnswered}
            className="mt-4 text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors w-fit"
          >
            Continue
          </button>
        </form>
        <div className="border-[#960018] border-l-4 bg-[#FFE2E2] flex gap-4 p-4 mt-10 sm:mt-12.5 ">
          <Info size={16} className="text-primary" />
          <div className="flex flex-col gap-0.75">
            <p className="text-xs font-semibold text-primary uppercase">
              Confidentiality Note
            </p>
            <p className="text-xs text-[#5A403F]">
              Your answers are protected under medical secrecy regulations.
              High-integrity data ensures the safety of both donor and
              recipient.
            </p>
          </div>
        </div>
      </>
    )
  );
}
