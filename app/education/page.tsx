"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, FileText } from "lucide-react";

export default function Education() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </Link>

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
                difference.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F9E8EE] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <BookOpen className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Blood Donation</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Learn about blood types, the donation process, eligibility 
                  requirements, and how your donation helps save lives.
                </p>
                <Link
                  href="/about-blood"
                  className="text-primary text-xs sm:text-sm mt-3 sm:mt-4 inline-block hover:underline"
                >
                  Learn more →
                </Link>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#E4E5FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <GraduationCap className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Sperm Donation</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Understand the sperm donation process, requirements, and how it 
                  helps individuals and couples build families.
                </p>
                <Link
                  href="/about-sperm"
                  className="text-primary text-xs sm:text-sm mt-3 sm:mt-4 inline-block hover:underline"
                >
                  Learn more →
                </Link>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F4F2FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <FileText className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Resources</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Access guides, FAQs, research articles, and educational 
                  materials to expand your knowledge about donation.
                </p>
                <Link
                  href="/faq"
                  className="text-primary text-xs sm:text-sm mt-3 sm:mt-4 inline-block hover:underline"
                >
                  View FAQs →
                </Link>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Start Learning Today
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Knowledge empowers action. Explore our educational resources and 
                discover how you can contribute to saving lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/about-donating"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
                >
                  Learn about donating
                </Link>
                <Link
                  href="/research"
                  className="w-fit border-2 border-primary text-primary text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-primary/10 transition-colors"
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

