"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowLeft,
  FlaskConical,
  BookOpen,
  Microscope,
  Database,
  TrendingUp,
} from "lucide-react";

export default function Research() {
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
            Lifesaving Research
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Advancing Medical Science
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Blivap is committed to supporting lifesaving research in blood
                products, therapeutics, services, diagnostics, and healthcare
                knowledge. Our platform enables researchers to access valuable
                data and collaborate with healthcare professionals to advance
                medical science and improve patient outcomes.
              </p>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Through our research initiatives, we contribute to the global
                understanding of blood-related diseases, donation processes, and
                healthcare delivery systems, ultimately saving more lives.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              {[
                {
                  icon: FlaskConical,
                  title: "Blood Products",
                  desc: "Research into improving blood storage, processing, and transfusion safety to enhance patient outcomes. We study preservation techniques, compatibility factors, and quality assurance methods.",
                  color: "bg-[#F4F2FF]",
                },
                {
                  icon: Microscope,
                  title: "Diagnostics",
                  desc: "Development of new diagnostic tools and methods for better disease detection and treatment monitoring. Our research focuses on early detection and precision medicine approaches.",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: BookOpen,
                  title: "Healthcare Knowledge",
                  desc: "Sharing knowledge and best practices to improve healthcare delivery and patient care across communities. We document and disseminate evidence-based practices.",
                  color: "bg-[#E4E5FF]",
                },
              ].map((research, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`${research.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}
                  >
                    <research.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                    {research.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    {research.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Research Opportunities
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Researchers and healthcare professionals can collaborate through
                Blivap to conduct studies, access anonymized data, and
                contribute to advancing medical science. Our platform provides
                tools and resources to support research initiatives, including
                data analytics, collaboration tools, and access to our network
                of medical facilities.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <TrendingUp className="text-primary" size={20} />
                    Data Access
                  </h4>
                  <p className="text-sm text-[#333333]">
                    Access anonymized, aggregated data for your research
                    projects while maintaining privacy and confidentiality
                    standards.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <Database className="text-primary" size={20} />
                    Collaboration Tools
                  </h4>
                  <p className="text-sm text-[#333333]">
                    Connect with other researchers, healthcare professionals,
                    and institutions to collaborate on research projects.
                  </p>
                </div>
              </div>
              <div>
                <Link
                  href="/researchers"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Learn more for researchers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
