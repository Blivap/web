"use client";

import { HomeLayout } from "../../layout/home.layout.component";
import Link from "next/link";
import { Droplet, CheckCircle, Clock, Shield, Heart } from "lucide-react";

export default function GivingBlood() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          Giving blood
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              The gift of life
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Giving blood is one of the most selfless acts you can do. Your
              donation can save up to three lives. Every donation matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                icon: Droplet,
                title: "Before donation",
                items: [
                  "Eat a healthy meal and stay hydrated",
                  "Get 7–8 hours sleep",
                  "Bring valid ID",
                  "Wear comfortable clothing (sleeves that roll up)",
                  "Avoid heavy exercise 24 hours before",
                  "Drink at least 500ml water before",
                ],
                color: "bg-[#FDF2F4]",
              },
              {
                icon: CheckCircle,
                title: "After donation",
                items: [
                  "Rest 10–15 minutes before leaving",
                  "Drink plenty of fluids for 24 hours",
                  "Avoid heavy lifting for 24 hours",
                  "Keep bandage on at least 4 hours",
                  "Eat iron-rich foods",
                  "Avoid alcohol for 24 hours",
                ],
                color: "bg-[#EEF2FF]",
              },
            ].map((section, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`${section.color} p-2 rounded-full`}>
                    <section.icon className="text-primary" size={18} />
                  </div>
                  <h3 className="font-semibold text-sm">{section.title}</h3>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-primary shrink-0 mt-0.5"
                        size={12}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Eligibility
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  General
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Age: 18–65",
                    "Weight: at least 50kg",
                    "Good general health",
                    "No recent illness",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-primary shrink-0 mt-0.5"
                        size={12}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  Frequency
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  <li className="flex items-start gap-2">
                    <Clock className="text-primary shrink-0 mt-0.5" size={12} />
                    Whole blood: every 56 days
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="text-primary shrink-0 mt-0.5" size={12} />
                    Platelets: every 7 days
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="text-primary shrink-0 mt-0.5" size={12} />
                    Plasma: every 28 days
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Ready to give?
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Join thousands of donors making a difference. The process takes
              less than an hour.
            </p>
            <Link
              href="https://calendly.com/care-blivap/30min"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
