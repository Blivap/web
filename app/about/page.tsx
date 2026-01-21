"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Heart, Target, Users, Award } from "lucide-react";
import Image from "next/image";

export default function About() {
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
                  these moments when it really matters. In a world full of
                  change, we continue to deliver safe blood products and connect
                  those in need with willing donors.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Thanks to our dedicated donors, patients get a chance at a
                  better future, and you also get a better life by donating.
                  Together, we help bring people who need Blood/Sperm to people
                  who are willing to donate blood/Sperm, creating a sustainable
                  ecosystem that saves lives.
                </p>
              </div>

              <div className="relative h-48 sm:h-64 md:h-96 bg-primary rounded-2xl overflow-hidden">
                <Image
                  src="/images/hero_image.jpg"
                  alt="About Blivap"
                  fill
                  className="object-cover rounded-2xl opacity-80"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              {[
                {
                  icon: Heart,
                  title: "Our Values",
                  desc: "We believe in saving lives, building communities, and making healthcare accessible to everyone, regardless of their circumstances. Integrity, compassion, and excellence guide everything we do.",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: Target,
                  title: "Our Goal",
                  desc: "To address the blood crisis in Nigeria and beyond by creating a platform that makes donation easy, safe, and rewarding for everyone involved. We aim to eliminate preventable deaths due to blood shortages.",
                  color: "bg-[#E4E5FF]",
                },
                {
                  icon: Users,
                  title: "Our Community",
                  desc: "We're building a community of donors, recipients, healthcare professionals, and researchers working together to save lives. Together, we're stronger and can make a greater impact.",
                  color: "bg-[#F4F2FF]",
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`${value.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}
                  >
                    <value.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <div className="flex items-center gap-3 mb-4">
                <Award className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Our Achievements
                </h2>
              </div>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[
                  { number: "10,000+", label: "Lives Saved" },
                  { number: "5,000+", label: "Active Donors" },
                  { number: "50+", label: "Partner Facilities" },
                  { number: "15+", label: "Cities Covered" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-lg text-center"
                  >
                    <p className="text-2xl font-bold text-primary mb-1">
                      {stat.number}
                    </p>
                    <p className="text-sm text-[#333333]">{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Whether you&apos;re looking to donate, need a donation, or want
                to support our mission, there&apos;s a place for you in the
                Blivap community. Together, we can make a difference and save
                lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div>
                  <Link
                    href="/auth?tab=register"
                    className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                  >
                    Register as a donor
                  </Link>
                </div>
                <div>
                  <Link
                    href="/contact"
                    className="w-fit border-2 border-primary text-primary text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-primary/10 transition-colors inline-block"
                  >
                    Contact us
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
