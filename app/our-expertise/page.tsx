"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Award, Shield, Users } from "lucide-react";

export default function OurExpertise() {
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
            Our Expertise
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Leading the Way in Donation Services
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Blivap brings together years of expertise in healthcare, technology, 
                and community building to create a platform that makes donation 
                services accessible, safe, and effective.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F9E8EE] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Shield className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Safety First</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We maintain the highest standards of safety and quality in all 
                  our donation processes, ensuring the well-being of both donors 
                  and recipients.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#E4E5FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Award className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Quality Assurance</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Our rigorous screening and matching processes ensure that every 
                  donation meets the highest quality standards.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F4F2FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Community Focus</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We understand the needs of our community and work tirelessly to 
                  improve access to life-saving donations.
                </p>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Our expertise has helped thousands of donors and recipients 
                connect safely and effectively. We're committed to continuing 
                to improve and expand our services.
              </p>
              <Link
                href="/about"
                className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
              >
                Learn more about us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

