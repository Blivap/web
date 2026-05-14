import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Layout } from "@/layout/layout.component";
import {
  DONATION_TYPE_ENTRIES,
  getDonationTypeBySlug,
} from "@/lib/donations/donation-types";
import { DonationTypeFlow } from "./donation-type-flow.component";

export function generateStaticParams() {
  return DONATION_TYPE_ENTRIES.map(({ slug }) => ({ slug }));
}

export default async function DonationTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getDonationTypeBySlug(slug);
  if (!entry) notFound();

  return (
    <Layout>
      <Suspense fallback={<div className="min-h-[200px]" aria-hidden />}>
        <DonationTypeFlow entry={entry} />
      </Suspense>
    </Layout>
  );
}
