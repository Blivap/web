export type DonationIntegration =
  | { kind: "blivap_blood"; registerHref: "/donors/new?type=blood" }
  | { kind: "blivap_sperm"; registerHref: "/donors/new?type=sperm" }
  | { kind: "blivap_ovary"; registerHref: "/donors/new?type=ovary" };

export type DonationTypeEntry = {
  slug: string;
  label: string;
  summary: string;
  integration: DonationIntegration;
};

/** In-app donation types that open donor registration. */
export const DONATION_TYPE_ENTRIES: DonationTypeEntry[] = [
  {
    slug: "blood-donation",
    label: "Blood donation",
    summary:
      "Whole blood donation supports transfusions, surgery, and emergencies. Blivap can guide you through donor registration and screening for this pathway.",
    integration: {
      kind: "blivap_blood",
      registerHref: "/donors/new?type=blood",
    },
  },
  {
    slug: "sperm-donation",
    label: "Sperm donation",
    summary:
      "Sperm donation involves screening, consent, and often clinic-led cycles. Blivap offers a structured intake that feeds into review for this pathway.",
    integration: {
      kind: "blivap_sperm",
      registerHref: "/donors/new?type=sperm",
    },
  },
  {
    slug: "egg-ovum-donation",
    label: "Egg (ovum) donation",
    summary:
      "Egg donation requires hormonal stimulation, retrieval, and legal consent frameworks. Continue into the ovum donor intake supported in Blivap today.",
    integration: {
      kind: "blivap_ovary",
      registerHref: "/donors/new?type=ovary",
    },
  },
];

const bySlug = new Map(
  DONATION_TYPE_ENTRIES.map((entry) => [entry.slug, entry]),
);

export function getDonationTypeBySlug(
  slug: string,
): DonationTypeEntry | undefined {
  return bySlug.get(slug);
}

export function isDonorRegistrationEnabled(entry: DonationTypeEntry): boolean {
  return (
    entry.integration.kind === "blivap_blood" ||
    entry.integration.kind === "blivap_sperm" ||
    entry.integration.kind === "blivap_ovary"
  );
}
