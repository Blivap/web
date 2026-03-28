"use client";

import { HomeLayout } from "../../components/layout/home.layout.component";
import Link from "next/link";
import { CheckCircle, Clock, Shield, Heart, Users } from "lucide-react";
import Image from "next/image";

export default function AboutDonating() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          About donating
        </h1>

        <div className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-base text-black">
                How to become a donor
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Donating blood or sperm is rewarding and saves lives. The
                process is simple, safe, and quick. At Blivap we make it easy:
                register online, book appointments, and track your history in
                one place.
              </p>
              <Link
                href="https://calendly.com/care-blivap/30min"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block w-fit transition-colors"
              >
                Book a demo
              </Link>
            </div>
            <div className="relative h-40 sm:h-52 rounded-lg overflow-hidden">
              <Image
                src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
                alt="Donation"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Shield,
                title: "Step 1: Register",
                desc: "Create your account and complete your donor profile. Your data is protected.",
                color: "bg-[#FDF2F4]",
              },
              {
                icon: Clock,
                title: "Step 2: Book",
                desc: "Schedule at a convenient time and location. Choose from centers across Nigeria.",
                color: "bg-[#EEF2FF]",
              },
              {
                icon: Heart,
                title: "Step 3: Donate",
                desc: "Visit the center, donate with trained staff, and help save lives.",
                color: "bg-[#F5F3FF]",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]"
              >
                <div className={`${step.color} p-2 rounded-full w-fit mb-2`}>
                  <step.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
            <h2 className="font-semibold text-base text-black mb-4">
              Benefits of donating
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-primary" size={16} />
                  <h3 className="font-semibold text-sm">For recipients</h3>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Life-saving blood or sperm for critical needs",
                    "Recovery from surgery, trauma, or conditions",
                    "Compatible donors via our matching system",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-primary shrink-0 mt-0.5"
                        size={12}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-primary" size={16} />
                  <h3 className="font-semibold text-sm">For donors</h3>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                  {[
                    "Earn while making a difference",
                    "Track history and build your profile",
                    "Save lives in your community",
                    "Free health screening with each donation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-primary shrink-0 mt-0.5"
                        size={12}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href="/register"
              className="inline-block mt-4 text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
            >
              Start your donor journey
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
