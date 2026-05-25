export type DonationIntegration =
  | { kind: "blivap_blood"; registerHref: "/donors/new?type=blood" }
  | { kind: "blivap_sperm"; registerHref: "/donors/new?type=sperm" }
  | { kind: "blivap_ovary"; registerHref: "/donors/new?type=ovary" }
  | { kind: "interest_only" };

export type DonationTypeEntry = {
  slug: string;
  label: string;
  summary: string;
  integration: DonationIntegration;
};

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
    slug: "plasma-donation",
    label: "Plasma donation",
    summary:
      "Plasma is used for clotting factors, immunoglobulins, and many therapies. Start with the blood donor path; staff will route you to apheresis plasma when eligible.",
    integration: {
      kind: "blivap_blood",
      registerHref: "/donors/new?type=blood",
    },
  },
  {
    slug: "platelet-donation",
    label: "Platelet donation",
    summary:
      "Platelets are often given to cancer and transplant patients. Registration typically begins through the blood donor program with apheresis scheduling afterward.",
    integration: {
      kind: "blivap_blood",
      registerHref: "/donors/new?type=blood",
    },
  },
  {
    slug: "bone-marrow-donation",
    label: "Bone marrow donation",
    summary:
      "Bone marrow donation can cure blood cancers and serious marrow disorders. Programs involve consent, HLA typing, and sometimes surgical harvest or related collection steps.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "stem-cell-donation",
    label: "Stem cell donation",
    summary:
      "Peripheral blood stem cell donation is closely related to marrow registries and apheresis. Eligibility and matching are handled by specialized registries and transplant centers.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "organ-donation",
    label: "Organ donation",
    summary:
      "Organ donation after death or in limited living-donor situations is coordinated nationally and through transplant centers—not something you complete fully inside an app.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "kidney-donation",
    label: "Kidney donation",
    summary:
      "Living or deceased kidney donation requires transplant evaluation, ethics review, and hospital coordination. Use this flow to note your interest while we expand tooling.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "liver-donation",
    label: "Liver donation",
    summary:
      "Living liver donation is a major surgical pathway with strict medical and psychosocial screening. Capture your interest here; clinical steps happen at transplant programs.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "lung-donation",
    label: "Lung donation",
    summary:
      "Lung transplantation relies on deceased donation and highly specialized teams. Express interest here to align with future Blivap features for education and referral.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "pancreas-donation",
    label: "Pancreas donation",
    summary:
      "Pancreas donation is almost always part of deceased multi-organ donation or research protocols. Record your interest so we can prioritize related product work.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "intestine-donation",
    label: "Intestine donation",
    summary:
      "Intestinal transplant is rare and hospital-led. This checklist item is for learning and interest capture until dedicated workflows exist.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "uterus-donation",
    label: "Uterus donation",
    summary:
      "Uterus transplant programs are experimental and limited to a few centers. Use this flow to log interest in being guided when programs expand.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "tissue-donation",
    label: "Tissue donation",
    summary:
      "Tissue donation includes many graft types recovered and processed under tissue-bank rules. Interest you log here helps shape future education and referral steps.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "cornea-donation",
    label: "Cornea donation",
    summary:
      "Eye banks coordinate corneal recovery and allocation. Registration is often through driver’s license or national registries depending on your country.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "skin-donation",
    label: "Skin donation",
    summary:
      "Donated skin supports burn care and reconstruction through hospital and tissue-bank networks. Complete this short flow to register your interest in Blivap.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "bone-donation",
    label: "Bone donation",
    summary:
      "Bone grafts come from screened donors via tissue establishments. This path captures intent while we build deeper integrations.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "tendon-donation",
    label: "Tendon donation",
    summary:
      "Tendon allografts are prepared from deceased donors under strict processing rules. Note your interest here for future guided steps.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "heart-valve-donation",
    label: "Heart valve donation",
    summary:
      "Valve recovery is part of cardiac tissue programs after consent and screening. Use this flow to track your exploration in Blivap.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "cartilage-donation",
    label: "Cartilage donation",
    summary:
      "Cartilage allografts are niche products from regulated tissue banks. Interest capture helps us know which educational flows to build next.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "blood-vessel-donation",
    label: "Blood vessel donation",
    summary:
      "Vascular graft donation is handled in deceased donation and tissue-banking contexts. Log interest to follow future Blivap guidance.",
    integration: { kind: "interest_only" },
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
  {
    slug: "embryo-donation",
    label: "Embryo donation",
    summary:
      "Embryo donation involves legal agreements, clinic policies, and recipient matching. This is an interest path until a dedicated workflow ships.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "breast-milk-donation",
    label: "Breast milk donation",
    summary:
      "Human milk banks screen donors and pasteurize milk for fragile infants. Programs are regional—capture interest here for future linking.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "placenta-donation",
    label: "Placenta donation",
    summary:
      "Placental tissue may be recovered for research or regulated products where programs exist. Use this flow to note your intent.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "umbilical-cord-blood-donation",
    label: "Umbilical cord blood donation",
    summary:
      "Cord blood is collected at birth for stem cell banks when mothers enroll ahead of delivery. Hospital programs vary by location.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "surrogacy",
    label: "Surrogacy",
    summary:
      "Surrogacy is a legal and medical journey involving contracts, IVF clinics, and counseling—not a single “donation” click. This flow records your interest in guidance.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "traditional-surrogacy",
    label: "Traditional surrogacy",
    summary:
      "Traditional surrogacy uses the surrogate’s egg and carries distinct legal and ethical considerations. Capture interest here for future educational modules.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "gestational-surrogacy",
    label: "Gestational surrogacy",
    summary:
      "Gestational surrogacy uses IVF with separate genetic parents. Coordination is clinic- and jurisdiction-specific; Blivap can later deepen support from this starting point.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "whole-body-donation-to-science",
    label: "Whole body donation to science",
    summary:
      "Body donation to science is arranged with anatomical programs and requires explicit consent separate from organ donor registries.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "brain-donation",
    label: "Brain donation",
    summary:
      "Brain donation for research often pairs with specialized research registries and post-mortem timing requirements.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "dna-donation",
    label: "DNA donation",
    summary:
      "DNA sharing for research should always be voluntary, informed, and tied to clear study governance. This path is interest-only in Blivap for now.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "genetic-sample-donation",
    label: "Genetic sample donation",
    summary:
      "Genetic samples for biobanks require consent, withdrawal rights, and often broad study use language. Log interest to follow product updates.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "clinical-trial-participation",
    label: "Clinical trial participation",
    summary:
      "Trials are protocol-driven and site-specific. Blivap may later help you track opportunities; for now this flow captures your interest.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "hair-donation",
    label: "Hair donation",
    summary:
      "Hair donation charities publish length and processing rules. This checklist item lets you mark intent while we explore partner integrations.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "skin-cell-donation",
    label: "Skin cell donation",
    summary:
      "Skin cell donation for research is handled under study-specific consent at academic or commercial labs.",
    integration: { kind: "interest_only" },
  },
  {
    slug: "cosmetic-research-tissue-donation",
    label: "Cosmetic research tissue donation",
    summary:
      "Cosmetic research must meet ethics review and consent standards. Use this flow to register interest in future guided research participation features.",
    integration: { kind: "interest_only" },
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
