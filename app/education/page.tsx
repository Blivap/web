"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function Education() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
        <div>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={20} />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <h1 className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Education
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Learn About Donation
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
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
                  title: "Blood Donation",
                  desc: "Learn about blood types, the donation process, eligibility requirements, and how your donation helps save lives. Comprehensive guides for first-time and regular donors.",
                  link: "/about-blood",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: GraduationCap,
                  title: "Sperm Donation",
                  desc: "Understand the sperm donation process, requirements, and how it helps individuals and couples build families. Learn about privacy, safety, and compensation.",
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
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`${topic.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}
                  >
                    <topic.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                    {topic.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333] mb-4">
                    {topic.desc}
                  </p>
                  <Link
                    href={topic.link}
                    className="text-primary text-xs sm:text-sm mt-3 sm:mt-4 inline-block hover:underline font-medium"
                  >
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-4">
                Educational Topics
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">For Donors</h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
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
                  <h4 className="font-semibold text-base mb-2">
                    For Recipients
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
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

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Start Learning Today
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Knowledge empowers action. Explore our educational resources and
                discover how you can contribute to saving lives. Education is
                the first step toward making a meaningful difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div>
                  <Link
                    href="/about-donating"
                    className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                  >
                    Learn about donating
                  </Link>
                </div>
                <div>
                  <Link
                    href="/research"
                    className="w-fit border-2 border-primary text-primary text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-primary/10 transition-colors inline-block"
                  >
                    View research
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
