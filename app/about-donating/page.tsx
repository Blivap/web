"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function AboutDonating() {
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
            About Donating
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  How to Become a Donor
                </h2>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Becoming a blood or sperm donor is a rewarding experience that 
                  helps save lives. The process is simple, safe, and takes only a 
                  short amount of your time.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  At Blivap, we make the donation process as easy and convenient 
                  as possible. You can register online, book appointments, and track 
                  your donation history all in one place.
                </p>
                <Link
                  href="/auth?tab=register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors mt-3 sm:mt-4"
                >
                  Register as a donor
                </Link>
              </div>

              <div className="relative h-48 sm:h-64 md:h-96 bg-[#F9E8EE] rounded-2xl">
                <Image
                  src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
                  alt="Donation process"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Step 1: Register</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Create your account on Blivap and complete your donor profile 
                  with your blood type and medical information.
                </p>
              </div>
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Step 2: Book Appointment</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Schedule your donation appointment at a convenient time and 
                  location that works for you.
                </p>
              </div>
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Step 3: Donate</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Visit the donation center, complete the donation process, 
                  and help save lives while earning compensation.
                </p>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Benefits of Donating
              </h2>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2">For Recipients</h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    Your donation provides life-saving blood or sperm to those in 
                    critical need, helping patients recover from surgery, trauma, 
                    or medical conditions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2">For Donors</h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    Earn money while making a difference. Track your donation 
                    history, build your donor profile, and contribute to saving 
                    lives in your community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

