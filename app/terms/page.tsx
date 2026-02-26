"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
            Terms and Conditions
          </h1>

          <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
            Last updated: February 2025
          </p>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Agreement to terms
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              By accessing or using Blivap&apos;s platform and services, you
              agree to be bound by these Terms and Conditions. If you do not
              agree, please do not use our services. We may update these terms
              from time to time; continued use after changes constitutes
              acceptance.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Eligibility
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              Donors must meet the eligibility criteria we publish (including
              age, health, and location requirements for blood and sperm
              donation). You are responsible for providing accurate information
              and for ensuring you are eligible at the time of each donation. We
              reserve the right to refuse or suspend participation if eligibility
              is not met.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Use of the platform
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              You agree to use Blivap only for lawful purposes and in
              accordance with these terms. You must not misuse the platform,
              provide false information, or attempt to harm other users or our
              systems. We may suspend or terminate your account for breach of
              these terms.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Donations and compensation
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              Compensation for donations (where applicable) is as described on
              the platform at the time of booking. Payment terms and processing
              are subject to our payment policy. We do not guarantee availability
              of donation opportunities and may cancel or reschedule in
              accordance with our policies and partner requirements.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Limitation of liability
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              Blivap connects donors with those in need and works with
              accredited partners. Our liability is limited to the extent
              permitted by law. We are not liable for indirect, consequential, or
              special damages arising from your use of the platform or from
              donation-related procedures carried out by third-party
              facilities.
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
              Contact
            </h2>
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
              For questions about these Terms and Conditions, contact us at{" "}
              <a
                href="mailto:legal@blivap.com"
                className="text-primary hover:underline"
              >
                legal@blivap.com
              </a>{" "}
              or through our{" "}
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
