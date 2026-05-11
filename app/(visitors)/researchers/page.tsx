"use client";

import { HomeLayout } from "@/layout/home.layout.component";
import { Button } from "@/components/ui/button";
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
      <div className="flex-1 flex flex-col sm:py-8">
        <h1 className="mb-6 text-lg font-semibold tracking-tight text-primary sm:text-xl">
          For researchers
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-2 text-base font-semibold text-black dark:text-white">
              Advance medical research
            </h2>
            <p className="max-w-2xl text-xs leading-relaxed text-[#6B7280] dark:text-slate-400 sm:text-sm">
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
                className="rounded-lg border border-[#E5E7EB] bg-white p-3 dark:border-white/10 dark:bg-[#111827] sm:p-4"
              >
                <div className={`${feature.color} mb-2 w-fit rounded-full p-2 dark:bg-white/10`}>
                  <feature.icon className="text-primary" size={18} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-black dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border-2 border-[#F5F3FF] bg-white p-4 dark:border-primary/20 dark:bg-[#111827]">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" size={18} />
              <h2 className="text-base font-semibold text-black dark:text-white">
                Research benefits
              </h2>
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold text-black dark:text-white">
                  For your research
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280] dark:text-slate-400">
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
                <h4 className="mb-2 text-xs font-semibold text-black dark:text-white">
                  Collaboration network
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280] dark:text-slate-400">
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

          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 dark:border-white/10 dark:bg-[#0F172A]">
            <h2 className="mb-2 text-base font-semibold text-black dark:text-white">
              Get started
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
              Register as a researcher to access our platform, data, and tools.
              Our team will guide you through registration and data access.
            </p>
            <Button
              variant="link"
              href="/register"
              className="text-xs font-medium py-2  px-6 rounded-full bg-primary text-white hover:bg-primary/90 hover:text-white! transition-colors w-fit"
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
