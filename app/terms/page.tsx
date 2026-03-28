"use client";

import { HomeLayout } from "../../components/layout/home.layout.component";
import Link from "next/link";

export default function Terms() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 max-w-3xl mx-auto">
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight">
            Terms and conditions
          </h1>

          <p className="text-xs text-[#6B7280] leading-relaxed">
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

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-base text-black">Eligibility</h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Donors must meet the eligibility criteria we publish (including
              age, health, and location requirements for blood and sperm
              donation). You are responsible for providing accurate information
              and for ensuring you are eligible at the time of each donation. We
              reserve the right to refuse or suspend participation if
              eligibility is not met.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-base text-black">
              Use of the platform
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              You agree to use Blivap only for lawful purposes and in accordance
              with these terms. You must not misuse the platform, provide false
              information, or attempt to harm other users or our systems. We may
              suspend or terminate your account for breach of these terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-base text-black">
              Donations and compensation
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Compensation for donations (where applicable) is as described on
              the platform at the time of booking. Payment terms and processing
              are subject to our payment policy. We do not guarantee
              availability of donation opportunities and may cancel or
              reschedule in accordance with our policies and partner
              requirements.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-base text-black">
              Limitation of liability
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Blivap connects donors with those in need and works with
              accredited partners. Our liability is limited to the extent
              permitted by law. We are not liable for indirect, consequential,
              or special damages arising from your use of the platform or from
              donation-related procedures carried out by third-party facilities.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-base text-black">Contact</h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
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
