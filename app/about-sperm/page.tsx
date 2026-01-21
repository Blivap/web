"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Shield,
  CheckCircle,
  Lock,
  Users,
} from "lucide-react";

export default function AboutSperm() {
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
            About Sperm Donation
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div
              className="flex flex-col gap-3 sm:gap-4"
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Helping Families Grow
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Sperm donation is a compassionate act that helps individuals and
                couples achieve their dream of starting a family. Through our
                secure and confidential platform, we connect sperm donors with
                those in need, ensuring privacy, safety, and quality throughout
                the process.
              </p>
            </div>

            <div
              className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8"
            >
              {[
                {
                  icon: Heart,
                  title: "For Donors",
                  desc: "As a sperm donor, you can help others while earning fair compensation. The process is confidential, safe, and straightforward, with comprehensive medical screening and support throughout.",
                  items: [
                    "Confidential and secure process",
                    "Fair compensation for your time",
                    "Medical screening and support",
                    "Flexible scheduling options",
                    "Comprehensive health monitoring",
                  ],
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: Users,
                  title: "For Recipients",
                  desc: "Find compatible sperm donors through our platform. We ensure quality, safety, and compatibility matching, with detailed donor profiles and medical history available.",
                  items: [
                    "Verified donor profiles",
                    "Compatibility matching",
                    "Secure and confidential",
                    "Detailed medical history",
                    "Quality assurance standards",
                  ],
                  color: "bg-[#E4E5FF]",
                },
              ].map((section, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`${section.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}
                  >
                    <section.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333] mb-3 sm:mb-4">
                    {section.desc}
                  </p>
                  <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle
                          className="text-primary mt-1 shrink-0"
                          size={18}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Eligibility & Requirements
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    Donor Requirements
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Age: 18-40 years old</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Good general health</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Pass medical and genetic screening</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>No family history of genetic disorders</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    Privacy & Safety
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <Lock className="text-primary mt-1" size={16} />
                      <span>Complete confidentiality guaranteed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="text-primary mt-1" size={16} />
                      <span>Secure data protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="text-primary mt-1" size={16} />
                      <span>Medical facility partnerships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="text-primary mt-1" size={16} />
                      <span>Legal compliance and support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8"
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Get Started
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Whether you&apos;re interested in becoming a donor or need a
                donor, we&apos;re here to help. Our platform makes the process
                simple, secure, and supportive. Join our community and help
                create families.
              </p>
              <div
              >
                <Link
                  href="/auth?tab=register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Register now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
