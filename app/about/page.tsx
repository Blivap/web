"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { Heart, Target, Users, Award } from "lucide-react";
import Image from "next/image";

export default function About() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-2">
          About Blivap
        </h1>

        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-base text-black">
                Our mission
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Blivap stands for life. For people. For making a difference when
                it really matters. We deliver safe blood products and connect
                those in need with willing donors.
              </p>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Thanks to our donors, patients get a chance at a better future.
                Together, we connect people who need blood or sperm with people
                willing to donate—building a sustainable ecosystem that saves
                lives.
              </p>
            </div>
            <div className="relative h-40 sm:h-52 md:h-64 bg-primary rounded-lg overflow-hidden">
              <Image
                src="/images/hero_image.jpg"
                alt="About Blivap"
                fill
                className="object-cover rounded-lg opacity-90"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Heart,
                title: "Our values",
                desc: "Saving lives, building communities, and making healthcare accessible. Integrity, compassion, and excellence guide everything we do.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Target,
                title: "Our goal",
                desc: "Address the blood crisis in Nigeria and beyond with a platform that makes donation easy, safe, and rewarding. We aim to eliminate preventable deaths from blood shortages.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: Users,
                title: "Our community",
                desc: "Donors, recipients, healthcare professionals, and researchers working together to save lives. Together we're stronger.",
                color: "bg-[#F5F3FF]",
              },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div className={`${value.color} p-2 rounded-full w-fit mb-2`}>
                  <value.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{value.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#F9FAFB] p-4 sm:p-5 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-primary" size={20} />
              <h2 className="font-semibold text-base text-black">
                Our achievements
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { number: "10,000+", label: "Lives saved" },
                { number: "5,000+", label: "Active donors" },
                { number: "50+", label: "Partner facilities" },
                { number: "15+", label: "Cities covered" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded-md text-center border border-[#E5E7EB]"
                >
                  <p className="text-base font-semibold text-primary">
                    {stat.number}
                  </p>
                  <p className="text-xs text-[#6B7280]">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Whether you want to donate, need a donation, or support our
              mission, there&apos;s a place for you in the Blivap community.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="https://calendly.com/care-blivap/30min"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors inline-block"
              >
                Book Demo
              </Link>
              <Link
                href="/contact"
                className="text-xs font-medium py-2 px-3.5 border border-primary text-primary hover:bg-primary/10 rounded-md transition-colors inline-block"
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
