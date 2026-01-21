"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Droplet, Heart, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function AboutBlood() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
        <div
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={20} />
            <span>Back to home</span>
          </Link>
        </div>

        <div
          className="flex flex-col gap-4 sm:gap-6 md:gap-8"
        >
          <h1
            className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
          >
            About Blood
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div
              className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
            >
              <div
                className="flex flex-col gap-3 sm:gap-4"
              >
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Understanding Blood
                </h2>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Blood is a vital fluid that circulates through our bodies,
                  delivering essential substances such as nutrients and oxygen
                  to the cells and transporting metabolic waste products away
                  from those same cells. It consists of plasma, red blood cells,
                  white blood cells, and platelets.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Blood plays a crucial role in maintaining our health and is
                  essential for life. Understanding blood types, compatibility,
                  and the donation process is important for both donors and
                  recipients.
                </p>
              </div>

              <div
                className="relative h-48 sm:h-64 md:h-96 bg-[#F4F2FF] rounded-2xl overflow-hidden"
              >
                <Image
                  src="/images/hero_image.jpg"
                  alt="Blood donation"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>

            <div
              className="flex flex-col gap-4 sm:gap-6 mt-6 sm:mt-8"
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Blood Types and Compatibility
              </h2>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#F9E8EE] p-2 rounded-full">
                      <Droplet className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold text-lg sm:text-xl">
                      Blood Groups
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary" size={16} />
                      <span>Type A - Contains A antigens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary" size={16} />
                      <span>Type B - Contains B antigens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary" size={16} />
                      <span>Type AB - Contains both A and B antigens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary" size={16} />
                      <span>
                        Type O - Contains no antigens (universal donor)
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#E4E5FF] p-2 rounded-full">
                      <Shield className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold text-lg sm:text-xl">
                      Rh Factor
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-[#333333] mb-3">
                    Blood can be Rh-positive or Rh-negative, which is determined
                    by the presence or absence of the Rh antigen on red blood
                    cells.
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-[#333333]">
                    <p>
                      <strong>Rh+:</strong> Contains Rh antigen (most common)
                    </p>
                    <p>
                      <strong>Rh-:</strong> Lacks Rh antigen (can receive Rh- or
                      Rh+ blood)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-3 rounded-full">
                  <Heart className="text-white" size={28} />
                </div>
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Why Blood Donation Matters
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Blood donations save lives every day. Whether it&pos; for
                surgery, trauma care, cancer treatment, or chronic conditions,
                donated blood is essential for medical care. Your donation can
                help up to three people in need.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    title: "Surgery",
                    desc: "Essential for operations and procedures",
                  },
                  {
                    title: "Trauma",
                    desc: "Critical for accident and emergency care",
                  },
                  {
                    title: "Cancer",
                    desc: "Vital for chemotherapy and treatment",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-lg"
                  >
                    <h4 className="font-semibold text-base mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#333333]">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div
              >
                <Link
                  href="/about-donating"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Learn about donating
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
