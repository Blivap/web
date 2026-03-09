"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { Briefcase, Users, Heart, Target, CheckCircle } from "lucide-react";

export default function WorkingAt() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 xl:px-36 py-6 sm:py-8 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          Working at Blivap
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-base text-black mb-2">
              Join our mission
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
              We&apos;re building a team of people dedicated to saving lives and
              improving healthcare access. Join us to make a meaningful
              difference while building a rewarding career.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Heart,
                title: "Our mission",
                desc: "We address the blood crisis and make life-saving donations accessible. Every team member plays a crucial role.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Users,
                title: "Our culture",
                desc: "Collaboration, innovation, and impact. We foster an inclusive, supportive work environment.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: Briefcase,
                title: "Open positions",
                desc: "We&apos;re always looking for talented people. Engineering, healthcare, marketing, operations—opportunities for growth.",
                color: "bg-[#F5F3FF]",
              },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div className={`${value.color} p-2 rounded-full w-fit mb-2`}>
                  <value.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{value.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black">
                What we offer
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-xs mb-2 text-black">
                  Career development
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Professional growth",
                    "Training and skill development",
                    "Mentorship and coaching",
                    "Clear career paths",
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
                  Work environment
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Flexible work arrangements",
                    "Competitive pay and benefits",
                    "Health and wellness",
                    "Inclusive, diverse team",
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
              Interested in joining us?
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              We&apos;re growing and looking for passionate people. Send us your
              resume—whether you&apos;re in engineering, healthcare, design, or
              marketing, we&apos;d love to hear from you.
            </p>
            <Link
              href="/contact"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
