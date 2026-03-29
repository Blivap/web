"use client";

import { HomeLayout } from "../../layout/home.layout.component";
import Link from "next/link";
import {
  FlaskConical,
  BookOpen,
  Microscope,
  Database,
  TrendingUp,
} from "lucide-react";

export default function Research() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 max-w-4xl mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          Lifesaving research
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Advancing medical science
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              Blivap supports research in blood products, therapeutics,
              diagnostics, and healthcare knowledge. We enable researchers to
              access data and collaborate with healthcare professionals to
              advance science and improve outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: FlaskConical,
                title: "Blood products",
                desc: "Improving storage, processing, and transfusion safety. Preservation, compatibility, and quality assurance.",
                color: "bg-[#F5F3FF]",
              },
              {
                icon: Microscope,
                title: "Diagnostics",
                desc: "New diagnostic tools and methods. Early detection and precision medicine.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: BookOpen,
                title: "Healthcare knowledge",
                desc: "Best practices to improve delivery and patient care. Evidence-based practices.",
                color: "bg-[#EEF2FF]",
              },
            ].map((research, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div
                  className={`${research.color} p-2 rounded-full w-fit mb-2`}
                >
                  <research.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">
                  {research.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {research.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-3">
              <Database className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                Research opportunities
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Researchers and healthcare professionals can collaborate through
              Blivap—conduct studies, access anonymized data, and use our
              analytics and collaboration tools.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-3 rounded-md border border-[#E5E7EB]">
                <h4 className="font-semibold text-xs mb-1 flex items-center gap-1.5">
                  <TrendingUp className="text-primary" size={14} />
                  Data access
                </h4>
                <p className="text-xs text-[#6B7280]">
                  Anonymized, aggregated data with privacy standards.
                </p>
              </div>
              <div className="bg-white p-3 rounded-md border border-[#E5E7EB]">
                <h4 className="font-semibold text-xs mb-1 flex items-center gap-1.5">
                  <Database className="text-primary" size={14} />
                  Collaboration
                </h4>
                <p className="text-xs text-[#6B7280]">
                  Connect with researchers and institutions.
                </p>
              </div>
            </div>
            <Link
              href="/researchers"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Learn more for researchers
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
