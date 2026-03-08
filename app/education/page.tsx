"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function Education() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight">
            Education
          </h1>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-base text-black">
                Learn about donation
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-2xl">
                Education is key to understanding the importance of donation and
                how it saves lives. Explore our resources to learn more about
                blood donation, sperm donation, and how you can make a
                difference in your community.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              {[
                {
                  icon: BookOpen,
                  title: "Blood donation",
                  desc: "Blood types, donation process, eligibility, and how your donation saves lives. Guides for first-time and regular donors.",
                  link: "/about-blood",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: GraduationCap,
                  title: "Sperm donation",
                  desc: "Process, requirements, and how it helps build families. Privacy, safety, and compensation.",
                  link: "/about-sperm",
                  color: "bg-[#E4E5FF]",
                },
                {
                  icon: FileText,
                  title: "Resources",
                  desc: "Access guides, FAQs, research articles, and educational materials to expand your knowledge about donation. Stay informed with the latest information.",
                  link: "/faq",
                  color: "bg-[#F4F2FF]",
                },
              ].map((topic, i) => (
                <div
                  key={i}
                  className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
                >
                  <div className={`${topic.color} p-2 rounded-full w-fit mb-2`}>
                    <topic.icon className="text-primary" size={18} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">
                    {topic.desc}
                  </p>
                  <Link
                    href={topic.link}
                    className="text-primary text-xs font-medium mt-3 inline-flex items-center gap-1 hover:underline"
                  >
                    Learn more <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg mt-4 border border-[#E5E7EB]">
              <h2 className="font-semibold text-base text-black mb-3">
                Educational topics
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-xs mb-2">For donors</h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Pre-donation preparation and requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>What to expect during donation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Post-donation care and recovery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Health benefits of regular donation</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-2">For recipients</h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Understanding blood types and compatibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>How to find compatible donors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>The donation process and timeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Safety and quality assurance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#F9FAFB] p-4 rounded-lg mt-4 border border-[#E5E7EB]">
              <h2 className="font-semibold text-base text-black mb-2">
                Start learning today
              </h2>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                Explore our resources and discover how you can contribute to
                saving lives.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/about-donating"
                  className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
                >
                  Learn about donating
                </Link>
                <Link
                  href="/research"
                  className="text-xs font-medium py-2 px-3.5 border border-primary text-primary hover:bg-primary/10 rounded-md inline-block transition-colors"
                >
                  View research
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
