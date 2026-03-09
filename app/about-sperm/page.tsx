"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { Heart, Shield, CheckCircle, Lock, Users } from "lucide-react";

export default function AboutSperm() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          About sperm donation
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Helping families grow
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Sperm donation helps individuals and couples start a family. Our
              platform connects donors with those in need, with privacy, safety,
              and quality throughout.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                icon: Heart,
                title: "For donors",
                desc: "Help others while earning fair compensation. Confidential, safe process with screening and support.",
                items: [
                  "Confidential process",
                  "Fair compensation",
                  "Medical screening",
                  "Flexible scheduling",
                  "Health monitoring",
                ],
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Users,
                title: "For recipients",
                desc: "Find compatible donors. Quality, safety, and compatibility matching with detailed profiles.",
                items: [
                  "Verified profiles",
                  "Compatibility matching",
                  "Confidential",
                  "Medical history",
                  "Quality assurance",
                ],
                color: "bg-[#EEF2FF]",
              },
            ].map((section, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div className={`${section.color} p-2 rounded-full w-fit mb-2`}>
                  <section.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">
                  {section.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
                  {section.desc}
                </p>
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
                Eligibility & requirements
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  Donor requirements
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Age: 18–40",
                    "Good general health",
                    "Pass medical and genetic screening",
                    "No family history of genetic disorders",
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
                  Privacy & safety
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Confidentiality guaranteed",
                    "Secure data protection",
                    "Medical facility partnerships",
                    "Legal compliance",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Lock
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
              Whether you want to become a donor or need a donor, we&apos;re
              here to help. The process is simple, secure, and supportive.
            </p>
            <Link
              href="/register"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Register now
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
