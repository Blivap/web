"use client";

import { HomeLayout } from "../../../layout/home.layout.component";
import { Button } from "@/components/button/button.component";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Who can donate blood?",
    answer:
      "Generally, healthy adults aged 18-65 can donate blood. You must weigh at least 50kg, be in good health, and meet certain medical criteria. We'll screen you during registration to confirm eligibility. Some conditions may temporarily or permanently defer you from donating, such as recent illnesses, certain medications, or travel to specific regions.",
  },
  {
    question: "How often can I donate?",
    answer:
      "You can donate whole blood every 56 days (about 8 weeks). This allows your body time to replenish the blood you've donated. For platelets, you can donate every 7 days (up to 24 times per year), and for plasma, every 28 days. Regular donors help maintain a stable blood supply for those in need.",
  },
  {
    question: "Is the donation process safe?",
    answer:
      "Yes, blood donation is very safe. We use sterile, single-use equipment for each donation, and all our facilities follow strict safety protocols. Our partner medical facilities are certified and regularly audited. All donors undergo a health screening before donation to ensure their safety and the safety of recipients.",
  },
  {
    question: "How much do I get paid for donating?",
    answer:
      "Compensation varies based on the type of donation and location. You'll see the exact amount when booking your appointment. Payments are processed securely through our platform. Compensation is fair and reflects the time and commitment required for donation.",
  },
  {
    question: "What about sperm donation?",
    answer:
      "Sperm donation has its own eligibility requirements and process. You must be between 18-40 years old, in good health, and pass medical and genetic screening. The process is confidential, and you'll receive fair compensation. Learn more on our About Sperm page for detailed information.",
  },
  {
    question: "How do I track my donation history?",
    answer:
      "Once registered, you can view your complete donation history in your dashboard, including dates, types of donations, and compensation received. You'll also receive notifications about upcoming eligible donation dates and can track your impact on lives saved.",
  },
  {
    question: "What happens to my blood after donation?",
    answer:
      "After donation, your blood is tested for infectious diseases, blood type, and other factors. It's then processed, stored, and distributed to hospitals and medical facilities where it's needed. The entire process is tracked to ensure safety and quality.",
  },
  {
    question: "Can I donate if I have a tattoo or piercing?",
    answer:
      "You can donate blood if you have a tattoo or piercing, but you must wait at least 3 months after getting it done. This waiting period helps ensure that any potential infections have been identified and treated before donation.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col py-6 sm:py-8">
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight">
            Frequently asked questions
          </h1>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#111827] lg:max-w-1/2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="h-auto w-full justify-between rounded-none p-3 text-left sm:p-4"
                >
                  <h3 className="pr-3 text-left text-sm font-semibold text-black dark:text-white">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`text-primary shrink-0 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`}
                    size={18}
                  />
                </Button>
                {openIndex === index && (
                  <div className="overflow-hidden">
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                      <p className="text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 dark:border-white/10 dark:bg-[#0F172A] lg:max-w-1/2">
            <h2 className="mb-2 text-base font-semibold text-black dark:text-white">
              Still have questions?
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
              Contact us and we&apos;ll get back to you as soon as possible.
            </p>
            <Button
              href="/contact"
              className="rounded-md px-3.5 py-2 text-xs font-medium"
            >
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
