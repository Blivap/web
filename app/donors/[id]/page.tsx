"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Droplet, MapPin, Star } from "lucide-react";
import { Layout } from "@/components/layout/layout.component";
import { ALL_DONORS } from "../donors.data";

export default function DonorDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const donorId = decodeURIComponent(params.id);
  const donor = ALL_DONORS.find((d) => d.id === donorId);

  return (
    <Layout>
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-3xl font-semibold text-text-primary">
              Donor details
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              View donor information before booking.
            </p>
          </div>
          <Link
            href="/donors"
            className="text-xs sm:text-sm font-medium text-primary hover:underline"
          >
            Back to donors
          </Link>
        </div>

        {!donor ? (
          <div className="rounded-xl border border-border bg-white p-5">
            <p className="text-sm text-text-primary font-medium">
              Donor not found
            </p>
            <p className="text-xs text-text-secondary mt-1">
              We couldn’t find a donor with id “{donorId}”.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_16px_rgba(15,23,42,0.03)] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative size-12 rounded-full bg-[#F3F4F6] overflow-hidden flex items-center justify-center">
                  <span className="text-sm font-semibold text-text-primary">
                    {donor.id.slice(0, 2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-text-primary">
                    Donor ID: {donor.id}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Available: {donor.packs} packs
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FDECEE] text-xs font-medium text-primary w-fit">
                <span>Blood type</span>
                <span className="font-semibold">{donor.bloodType}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="rounded-xl border border-border bg-[#F9FAFB] p-4">
                <p className="text-xs text-text-secondary mb-2">Rating</p>
                <div className="flex items-center gap-2">
                  <Star
                    className="size-4 text-[#FACC15] fill-[#FACC15]"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-semibold text-text-primary">
                    {donor.rating.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-[#F9FAFB] p-4">
                <p className="text-xs text-text-secondary mb-2">Donations</p>
                <div className="flex items-center gap-2">
                  <Droplet className="size-4 text-primary" />
                  <p className="text-sm font-semibold text-text-primary">
                    {donor.donations}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-[#F9FAFB] p-4">
                <p className="text-xs text-text-secondary mb-2">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-text-primary" />
                  <p className="text-sm font-semibold text-text-primary">
                    {donor.location}, {donor.country}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href={`/donors/new?donorId=${encodeURIComponent(donor.id)}&${searchParams.toString()}`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Book appointment
              </Link>
              <Link
                href="/donors"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border bg-white text-sm font-medium text-text-primary hover:bg-[#F9FAFB] transition-colors"
              >
                Choose another donor
              </Link>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
