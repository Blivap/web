"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Briefcase, Users, Heart } from "lucide-react";

export default function WorkingAt() {
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
            Working at Blivap
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Join Our Mission
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                At Blivap, we're building a team of passionate individuals 
                dedicated to saving lives and improving healthcare access. Join 
                us in making a meaningful difference in people's lives.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F9E8EE] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Heart className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Our Mission</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We're committed to addressing the blood crisis and making 
                  life-saving donations accessible to everyone.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#E4E5FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Our Culture</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We value collaboration, innovation, and a shared commitment to 
                  making a positive impact on healthcare.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="bg-[#F4F2FF] p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Open Positions</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  We're always looking for talented individuals to join our team. 
                  Check back regularly for new opportunities.
                </p>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Interested in Joining Us?
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                We're growing and always looking for passionate people to join 
                our mission. Send us your resume and let's talk about how you can 
                contribute to saving lives.
              </p>
              <Link
                href="/contact"
                className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

