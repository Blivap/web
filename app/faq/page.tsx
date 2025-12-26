"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Who can donate blood?",
    answer: "Generally, healthy adults aged 18-65 can donate blood. You must weigh at least 50kg, be in good health, and meet certain medical criteria. We'll screen you during registration to confirm eligibility."
  },
  {
    question: "How often can I donate?",
    answer: "You can donate whole blood every 56 days (about 8 weeks). This allows your body time to replenish the blood you've donated."
  },
  {
    question: "Is the donation process safe?",
    answer: "Yes, blood donation is very safe. We use sterile, single-use equipment for each donation, and all our facilities follow strict safety protocols."
  },
  {
    question: "How much do I get paid for donating?",
    answer: "Compensation varies based on the type of donation and location. You'll see the exact amount when booking your appointment. Payments are processed securely through our platform."
  },
  {
    question: "What about sperm donation?",
    answer: "Sperm donation has its own eligibility requirements and process. You must be between 18-40 years old, in good health, and pass medical and genetic screening. Learn more on our About Sperm page."
  },
  {
    question: "How do I track my donation history?",
    answer: "Once registered, you can view your complete donation history in your dashboard, including dates, types of donations, and compensation received."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </Link>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <h1 className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h1>

          <div className="flex flex-col gap-3 sm:gap-4 max-w-3xl">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-base sm:text-lg text-black pr-3 sm:pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`text-primary flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    size={20} 
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                    <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 max-w-3xl">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
              Still have questions?
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link
              href="/contact"
              className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

