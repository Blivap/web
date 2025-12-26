"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Droplet, CheckCircle } from "lucide-react";

export default function GivingBlood() {
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
            Giving Blood
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                The Gift of Life
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Giving blood is one of the most selfless acts you can do. Your 
                donation can save up to three lives and make a significant 
                difference in someone's health journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-[#F9E8EE] p-2 sm:p-3 rounded-full">
                    <Droplet className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl">Before Donation</h3>
                </div>
                <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Eat a healthy meal and stay hydrated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Get a good night's sleep</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Bring a valid ID</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-[#E4E5FF] p-2 sm:p-3 rounded-full">
                    <CheckCircle className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl">After Donation</h3>
                </div>
                <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Rest for 10-15 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Drink plenty of fluids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Avoid heavy lifting for 24 hours</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Ready to Give?
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Join thousands of donors who are making a difference. Register 
                today and start saving lives.
              </p>
              <Link
                href="/auth?tab=register"
                className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
              >
                Register as a donor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

