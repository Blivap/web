"use client";

import { HomeLayout } from "../../components/layout/home.layout.component";
import Link from "next/link";
import {
  Stethoscope,
  Users,
  FileText,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function Healthcare() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          For healthcare professionals
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Partner with Blivap
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Healthcare professionals play a crucial role. Blivap gives you
              tools to connect with donors, manage appointments, and ensure safe
              donations. Join our network and help save lives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Stethoscope,
                title: "Donor management",
                desc: "Access verified donors and manage appointments through our platform. Streamline your workflow.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Users,
                title: "Patient matching",
                desc: "Find compatible donors with our matching system. Instant notifications when matches are found.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: FileText,
                title: "Resources",
                desc: "Educational materials, research data, and best practices. Stay updated with medical guidelines.",
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
              <Calendar className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Platform features
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  For your practice
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Easy appointment scheduling",
                    "Real-time donor availability",
                    "Patient record management",
                    "Automated notifications",
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
                  Support & training
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Training materials",
                    "24/7 technical support",
                    "Updates and best practices",
                    "Dedicated account manager",
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
              Connect with other professionals, access our donor network, and
              improve healthcare outcomes. Register your facility and join a
              life-saving network.
            </p>
            <Link
              href="/healthcare&professionals"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
