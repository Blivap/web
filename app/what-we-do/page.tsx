"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Droplet, Heart, Users } from "lucide-react";
import Image from "next/image";

export default function WhatWeDo() {
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
            What We Do
          </h1>

          <div className="flex flex-col gap-6 sm:gap-8 md:gap-12">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Connecting Donors and Recipients
                </h2>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Blivap is a platform that connects people who need blood or sperm 
                  with willing donors. We help match compatible blood groups and 
                  facilitate the donation process, making it easier for everyone 
                  involved.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Our mission is to address the blood crisis in Nigeria and beyond, 
                  ensuring that life-saving donations are accessible to those who 
                  need them most.
                </p>
              </div>

              <div className="relative h-48 sm:h-64 md:h-96 bg-primary rounded-2xl">
                <Image
                  src="/images/hero_image.jpg"
                  alt="What we do"
                  fill
                  className="object-cover rounded-2xl opacity-80"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                <div className="bg-[#F9E8EE] p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                  <Droplet className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Blood Donation</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Connect blood donors with recipients who need life-saving 
                  transfusions. We match compatible blood types and facilitate 
                  safe donations.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                <div className="bg-[#E4E5FF] p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                  <Heart className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Sperm Donation</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Help individuals and couples find sperm donors through our 
                  secure and confidential platform.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                <div className="bg-[#F4F2FF] p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Community Support</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Build a community of donors and recipients working together 
                  to save lives and improve healthcare access.
                </p>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Our Impact
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Since our launch, Blivap has facilitated thousands of successful 
                donations, connecting donors with recipients across Nigeria. We're 
                committed to expanding access to life-saving donations and 
                improving healthcare outcomes for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/about-donating"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
                >
                  Become a donor
                </Link>
                <Link
                  href="/about"
                  className="w-fit border-2 border-primary text-primary text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-primary/10 transition-colors"
                >
                  Learn more about Blivap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

