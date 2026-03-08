"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  Award,
  Shield,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";

export default function OurExpertise() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          Our expertise
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Leading the way in donation services
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Blivap combines healthcare, technology, and community building to
              make donation services accessible, safe, and effective. Medical
              knowledge, innovation, and compassionate service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Shield,
                title: "Safety first",
                desc: "Highest standards of safety and quality. Partner facilities are certified and regularly audited.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Award,
                title: "Quality assurance",
                desc: "Rigorous screening and matching. We follow international best practices and local regulations.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: Users,
                title: "Community focus",
                desc: "We understand community needs and work to improve access to life-saving donations.",
                color: "bg-[#F5F3FF]",
              },
            ].map((expertise, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div
                  className={`${expertise.color} p-2 rounded-full w-fit mb-2`}
                >
                  <expertise.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">
                  {expertise.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {expertise.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Our core competencies
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  Medical expertise
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Certified medical facility partnerships",
                    "Qualified healthcare professionals",
                    "Comprehensive screening",
                    "Quality control and assurance",
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
                  Technology
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Advanced matching algorithms",
                    "Secure platform and data",
                    "Real-time tracking",
                    "Mobile-first design",
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
              Trusted by thousands
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Our expertise has helped thousands connect safely. We&apos;re
              committed to improving and expanding, always putting safety and
              quality first.
            </p>
            <Link
              href="/about"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Learn more about us
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
