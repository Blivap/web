"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Users,
  Heart,
  Target,
  CheckCircle,
} from "lucide-react";

export default function WorkingAt() {
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
            Working at Blivap
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div
              className="flex flex-col gap-3 sm:gap-4"
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Join Our Mission
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                At Blivap, we&apos;re building a team of passionate individuals
                dedicated to saving lives and improving healthcare access. Join
                us in making a meaningful difference in people&apos;s lives
                while building a rewarding career in a purpose-driven
                organization.
              </p>
            </div>

            <div
              className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8"
            >
              {[
                {
                  icon: Heart,
                  title: "Our Mission",
                  desc: "We're committed to addressing the blood crisis and making life-saving donations accessible to everyone. Every team member plays a crucial role in this mission.",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: Users,
                  title: "Our Culture",
                  desc: "We value collaboration, innovation, and a shared commitment to making a positive impact on healthcare. We foster an inclusive, supportive work environment.",
                  color: "bg-[#E4E5FF]",
                },
                {
                  icon: Briefcase,
                  title: "Open Positions",
                  desc: "We're always looking for talented individuals to join our team. From engineering to healthcare, marketing to operations, we have opportunities for growth.",
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

            <div
              className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  What We Offer
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    Career Development
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Professional growth opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Training and skill development programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Mentorship and coaching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Clear career progression paths</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    Work Environment
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Flexible work arrangements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Competitive compensation and benefits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Health and wellness programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Inclusive and diverse team</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8"
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Interested in Joining Us?
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                We&apos;re growing and always looking for passionate people to
                join our mission. Send us your resume and let&apos;s talk about
                how you can contribute to saving lives. Whether you&apos;re a
                developer, healthcare professional, designer, or marketer,
                we&apos;d love to hear from you.
              </p>
              <div
              >
                <Link
                  href="/contact"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
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
