import { JsonLd } from "@/components/JsonLd";
import { getSiteOrigin } from "@/lib/site-origin";

export function HomeStructuredData() {
  const siteUrl = getSiteOrigin();
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const logoUrl = `${siteUrl}/web-app-manifest-512x512.png`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Blivap",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: 512,
          height: 512,
        },
        image: logoUrl,
        description:
          "Blivap connects people in need with donors and healthcare support. Discover, connect, and make a difference.",
        foundingDate: "2024",
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
          "@id": "https://www.wikidata.org/wiki/Q1033",
        },
        knowsAbout: [
          "Blood donation",
          "Sperm donation",
          "Donor matching",
          "Healthcare coordination in Nigeria",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@blivap.com",
          availableLanguage: ["English"],
          areaServed: "NG",
        },
        sameAs: ["https://www.instagram.com/official_blivap"],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "Blivap",
        url: siteUrl,
        publisher: { "@id": orgId },
        inLanguage: "en",
      },
    ],
  };

  return <JsonLd data={data} />;
}
