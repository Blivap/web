"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";

export default function Privacy() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="font-semibold text-primary text-base sm:text-lg tracking-tight">
            Privacy & cookies
          </h1>

          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            Last updated: February 2025
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-base sm:text-lg md:text-xl text-black">
              Introduction
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Blivap (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
              committed to protecting your privacy. This policy explains how we
              collect, use, store, and protect your personal information when
              you use our platform to donate blood or sperm, or when you access
              our services in Nigeria.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-base sm:text-lg md:text-xl text-black">
              Information we collect
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              We collect information you provide when registering (name, email,
              phone, address, health-related information for donor eligibility),
              information from your use of our services (donation history,
              preferences), and technical data (IP address, device type,
              browser) to improve our platform and security.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-base sm:text-lg md:text-xl text-black">
              How we use your information
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              We use your information to match donors with those in need,
              process donations and payments, communicate with you about
              appointments and results, improve our services, comply with legal
              obligations, and send you relevant updates (with your consent).
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-base sm:text-lg md:text-xl text-black">
              Cookies
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              We use cookies and similar technologies to keep you logged in,
              remember your preferences, understand how you use our site, and
              improve performance. You can manage cookie settings in your
              browser; however, disabling certain cookies may affect how the
              platform works.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-base sm:text-lg md:text-xl text-black">
              Data security and retention
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              We implement appropriate technical and organisational measures to
              protect your data. We retain your information only for as long as
              necessary to fulfil the purposes described in this policy or as
              required by law.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-medium text-base sm:text-lg md:text-xl text-black">
              Contact us
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
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
