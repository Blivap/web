"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Heart, Target, Users } from "lucide-react";
import Image from "next/image";

export default function About() {
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
            About Blivap
          </h1>

          <div className="flex flex-col gap-6 sm:gap-8 md:gap-12">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Our Mission
                </h2>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Blivap stands for life. For people. For making a difference at 
                  these moments when it really matters. In a world full of change, 
                  we continue to deliver safe blood products and connect those in 
                  need with willing donors.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Thanks to our dedicated donors, patients get a chance at a better 
                  future, and you also get a better life by donating. Together, we 
                  help bring people who need Blood/Sperm to people who are willing 
                  to donate blood/Sperm.
                </p>
              </div>

              <div className="relative h-48 sm:h-64 md:h-96 bg-primary rounded-2xl">
                <Image
                  src="/images/hero_image.jpg"
                  alt="About Blivap"
                  fill
                  className="object-cover rounded-2xl opacity-80"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F9E8EE] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Heart className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Our Values</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We believe in saving lives, building communities, and making 
                  healthcare accessible to everyone, regardless of their 
                  circumstances.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#E4E5FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Target className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Our Goal</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  To address the blood crisis in Nigeria and beyond by creating 
                  a platform that makes donation easy, safe, and rewarding for 
                  everyone involved.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F4F2FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Our Community</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We're building a community of donors, recipients, healthcare 
                  professionals, and researchers working together to save lives.
                </p>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Join Us
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Whether you're looking to donate, need a donation, or want to 
                support our mission, there's a place for you in the Blivap 
                community. Together, we can make a difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/auth?tab=register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
                >
                  Register as a donor
                </Link>
                <Link
                  href="/contact"
                  className="w-fit border-2 border-primary text-primary text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-primary/10 transition-colors"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

