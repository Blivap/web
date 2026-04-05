"use client";

import { HomeLayout } from "@/layout/home.layout.component";
import Link from "next/link";
import {
  FlaskConical,
  Database,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function Researchers() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 xl:px-36 py-6 sm:py-8 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          For researchers
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Advance medical research
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Blivap gives researchers access to data, tools, and resources.
              Join our community and contribute to discoveries that improve
              healthcare outcomes. We facilitate collaboration between
              researchers, healthcare professionals, and institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Database,
                title: "Data access",
                desc: "Anonymized, aggregated data with privacy standards. Analytics to identify patterns and trends.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: FlaskConical,
                title: "Research tools",
                desc: "Platform tools and APIs for studies and donation patterns. Analytics and visualization.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: Users,
                title: "Collaboration",
                desc: "Connect with researchers and institutions. Share findings and build on each other's work.",
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

          <div className="bg-white p-4 rounded-lg border-2 border-[#F5F3FF]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Research benefits
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-xs mb-2">
                  For your research
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Large, diverse datasets",
                    "Real-time data updates",
                    "Analytics and visualization",
                    "IRB-approved protocols",
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
                <h4 className="font-semibold text-xs mb-2">
                  Collaboration network
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "International researchers",
                    "Share findings and publications",
                    "Funding opportunities",
                    "Publish in our network",
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
              Get started
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Register as a researcher to access our platform, data, and tools.
              Our team will guide you through registration and data access.
            </p>
            <Link
              href="https://calendly.com/care-blivap/30min"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Register as researcher
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
