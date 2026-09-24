import { config } from "@/config/env";

const { url, env } = config;
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: "Blivap",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/android-chrome-512x512.png`,
    description:
      "Blivap connects people in need with donors, healthcare support, and meaningful opportunities to give. Discover, connect, and make a difference through a trusted digital platform.",
    foundingDate: "2024",
    sameAs: [
      // Add your social media links here when available
      // "https://twitter.com/blivap",
      // "https://facebook.com/blivap",
      // "https://instagram.com/blivap",
      // "https://linkedin.com/company/blivap",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English"],
      areaServed: "NG",
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
      "@id": "https://www.wikidata.org/wiki/Q1033",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: "Blivap",
    url: siteUrl,
    description:
      "Blivap connects people in need with donors, healthcare support, and meaningful opportunities to give. Discover, connect, and make a difference through a trusted digital platform.",
    publisher: {
      "@id": `${siteUrl}#organization`,
    },
    inLanguage: "en-US",
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
    "@id": `${siteUrl}#medical-business`,
    name: "Blivap",
    description:
      "Blivap connects people in need with donors, healthcare support, and meaningful opportunities to give. Discover, connect, and make a difference through a trusted digital platform.",
    url: siteUrl,
    image: `${siteUrl}/android-chrome-512x512.png`,
    medicalSpecialty: ["Blood Donation", "Sperm Donation", "Medical Services"],
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
      "@id": "https://www.wikidata.org/wiki/Q1033",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
    priceRange: "$$",
    telephone: "+234-XXX-XXXX",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema, null, 0),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema, null, 0),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalBusinessSchema, null, 0),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 0),
        }}
      />
    </>
  );
}
