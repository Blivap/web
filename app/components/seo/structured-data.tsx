"use client";

import config from "../../utils/config";

const { url, env } = config();
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Blivap",
    url: siteUrl,
    logo: `${siteUrl}/Logo/android-chrome-512x512.png`,
    description:
      "Blivap connects blood and sperm donors with people in need across Nigeria. Join our platform to donate, save lives, and make a meaningful impact.",
    sameAs: [
      // Add your social media links here when available
      // "https://twitter.com/blivap",
      // "https://facebook.com/blivap",
      // "https://instagram.com/blivap",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English"],
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Blivap",
    url: siteUrl,
    description:
      "Blood and sperm donation platform connecting donors with people in need across Nigeria.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const medicalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Blivap",
    description:
      "Medical donation platform connecting blood and sperm donors with recipients in Nigeria.",
    url: siteUrl,
    medicalSpecialty: "Blood Donation, Sperm Donation",
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }}
      />
    </>
  );
}
