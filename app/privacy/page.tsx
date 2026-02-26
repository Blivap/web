"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 max-w-3xl">
          <h1 className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Privacy & Cookies
          </h1>

          <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
            Last updated: February 2025
          </p>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Introduction
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              Blivap (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
              committed to protecting your privacy. This policy explains how we
              collect, use, store, and protect your personal information when you
              use our platform to donate blood or sperm, or when you access our
              services in Nigeria.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Information we collect
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              We collect information you provide when registering (name, email,
              phone, address, health-related information for donor eligibility),
              information from your use of our services (donation history,
              preferences), and technical data (IP address, device type, browser)
              to improve our platform and security.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              How we use your information
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              We use your information to match donors with those in need,
              process donations and payments, communicate with you about
              appointments and results, improve our services, comply with legal
              obligations, and send you relevant updates (with your consent).
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Cookies
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              We use cookies and similar technologies to keep you logged in,
              remember your preferences, understand how you use our site, and
              improve performance. You can manage cookie settings in your
              browser; however, disabling certain cookies may affect how the
              platform works.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Data security and retention
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              We implement appropriate technical and organisational measures to
              protect your data. We retain your information only for as long as
              necessary to fulfil the purposes described in this policy or as
              required by law.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Contact us
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              If you have questions about this Privacy & Cookies policy or your
              personal data, please contact us at{" "}
              <a
                href="mailto:privacy@blivap.com"
                className="text-primary hover:underline"
              >
                privacy@blivap.com
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact
              </Link>{" "}
              page.
            </p>
          </section>
        </div>
      </div>
    </HomeLayout>
  );
}
