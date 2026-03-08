"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { Droplet, Heart, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function AboutBlood() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          About blood
        </h1>

        <div className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-base text-black">
                Understanding blood
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Blood circulates through our bodies, delivering nutrients and
                oxygen and removing waste. It consists of plasma, red and white
                blood cells, and platelets. Understanding types, compatibility,
                and the donation process matters for donors and recipients.
              </p>
            </div>
            <div className="relative h-40 sm:h-52 rounded-lg overflow-hidden">
              <Image
                src="/images/hero_image.jpg"
                alt="Blood donation"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#FDF2F4] p-2 rounded-full">
                  <Droplet className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm">Blood groups</h3>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
                {[
                  "Type A – A antigens",
                  "Type B – B antigens",
                  "Type AB – A and B antigens",
                  "Type O – No antigens (universal donor)",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="text-primary shrink-0" size={12} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#EEF2FF] p-2 rounded-full">
                  <Shield className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm">Rh factor</h3>
              </div>
              <p className="text-xs text-[#6B7280] mb-2">
                Rh+ or Rh− is determined by the presence or absence of the Rh
                antigen.
              </p>
              <p className="text-xs text-[#6B7280]">
                <strong>Rh+:</strong> Most common. <strong>Rh−:</strong> Can
                receive Rh− or Rh+.
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary p-2 rounded-full">
                <Heart className="text-white" size={18} />
              </div>
              <h2 className="font-semibold text-base text-black">
                Why donation matters
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Donations save lives every day—surgery, trauma, cancer treatment,
              chronic conditions. One donation can help up to three people.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { title: "Surgery", desc: "Operations & procedures" },
                { title: "Trauma", desc: "Emergency care" },
                { title: "Cancer", desc: "Chemotherapy & treatment" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2.5 rounded-md border border-[#E5E7EB]"
                >
                  <h4 className="font-semibold text-xs mb-0.5">{item.title}</h4>
                  <p className="text-[10px] text-[#6B7280]">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/about-donating"
              className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
            >
              Learn about donating
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
