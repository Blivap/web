"use client";

import { HomeLayout } from "../../layout/home.layout.component";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  FileText,
  CheckCircle,
  Shield,
} from "lucide-react";

export default function HealthcareProfessionals() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 xl:px-36 py-6 sm:py-8 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          Healthcare professionals
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Partner with Blivap
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Healthcare professionals are essential to our mission. Blivap
              gives you tools to connect with donors, manage donation processes,
              and improve outcomes for your patients. Join our network and help
              save lives every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Stethoscope,
                title: "Donor network",
                desc: "Access verified donors and find compatible matches. Real-time availability so you can find donors when needed.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Calendar,
                title: "Appointment management",
                desc: "Schedule and manage donation appointments in one place. Automated reminders keep everyone informed.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: FileText,
                title: "Patient records",
                desc: "Secure records of donations and outcomes. Easy access to patient history and donation tracking.",
                color: "bg-[#F5F3FF]",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div className={`${feature.color} p-2 rounded-full w-fit mb-2`}>
                  <feature.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Why partner with us
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  Platform benefits
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Streamlined workflow integration",
                    "24/7 access to donor network",
                    "Automated matching and notifications",
                    "Reporting and analytics",
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
                  Support services
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Dedicated account management",
                    "Training and onboarding",
                    "Technical support",
                    "Regular updates",
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
            </div>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
            <h2 className="font-semibold text-base text-black mb-2">
              Join our network
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Register your facility to access our donor network, tools, and
              resources. Contact us to learn about partnership opportunities.
            </p>
            <Link
              href="/contact"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Contact us to get started
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
