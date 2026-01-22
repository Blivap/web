"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowLeft,
  FlaskConical,
  Database,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function Researchers() {
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
            For Researchers
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Advance Medical Research
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Blivap provides researchers with access to valuable data, tools,
                and resources to advance medical science. Join our research
                community and contribute to lifesaving discoveries that improve
                healthcare outcomes for everyone.
              </p>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Our platform facilitates collaboration between researchers,
                healthcare professionals, and institutions, enabling
                groundbreaking research in blood products, diagnostics, and
                healthcare delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              {[
                {
                  icon: Database,
                  title: "Data Access",
                  desc: "Access anonymized, aggregated data for your research projects while maintaining privacy and confidentiality. Our data analytics tools help you identify patterns and trends.",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: FlaskConical,
                  title: "Research Tools",
                  desc: "Use our platform's tools and APIs to conduct studies and analyze donation patterns and outcomes. Built-in analytics and visualization tools support your research.",
                  color: "bg-[#E4E5FF]",
                },
                {
                  icon: Users,
                  title: "Collaboration",
                  desc: "Connect with other researchers, healthcare professionals, and institutions to collaborate on research projects. Share findings and build on each other's work.",
                  color: "bg-[#F4F2FF]",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`${feature.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}
                  >
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Research Benefits
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    For Your Research
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Access to large, diverse datasets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Real-time data updates and insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Advanced analytics and visualization tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>IRB-approved data access protocols</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    Collaboration Network
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Connect with international researchers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Share research findings and publications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Access to research funding opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Publish research in our network</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Get Started
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Register as a researcher to access our platform, data, and
                collaboration tools. Help us advance medical science and save
                lives through groundbreaking research. Our team will guide you
                through the registration and data access process.
              </p>
              <div>
                <Link
                  href="/register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Register as researcher
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
