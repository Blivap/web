"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

export default function AboutSperm() {
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
            About Sperm Donation
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Helping Families Grow
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Sperm donation is a compassionate act that helps individuals and 
                couples achieve their dream of starting a family. Through our 
                secure and confidential platform, we connect sperm donors with 
                those in need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F9E8EE] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Heart className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">For Donors</h3>
                <p className="text-sm sm:text-base text-[#333333] mb-3 sm:mb-4">
                  As a sperm donor, you can help others while earning 
                  compensation. The process is confidential, safe, and 
                  straightforward.
                </p>
                <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                  <li>• Confidential and secure process</li>
                  <li>• Fair compensation</li>
                  <li>• Medical screening and support</li>
                </ul>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#E4E5FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Heart className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">For Recipients</h3>
                <p className="text-sm sm:text-base text-[#333333] mb-3 sm:mb-4">
                  Find compatible sperm donors through our platform. We ensure 
                  quality, safety, and compatibility matching.
                </p>
                <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                  <li>• Verified donor profiles</li>
                  <li>• Compatibility matching</li>
                  <li>• Secure and confidential</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Get Started
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Whether you're interested in becoming a donor or need a donor, 
                we're here to help. Our platform makes the process simple, 
                secure, and supportive.
              </p>
              <Link
                href="/auth?tab=register"
                className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
              >
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

