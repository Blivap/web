"use client";

import { useParams } from "next/navigation";
import { Layout } from "@/layout/layout.component";
import { MeetupSessionView } from "../components/meetup-session.view";

export default function MeetupSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const raw = params?.sessionId;
  const sessionId =
    typeof raw === "string" ? decodeURIComponent(raw) : Array.isArray(raw)
      ? decodeURIComponent(raw[0] ?? "")
      : "";

  if (!sessionId) {
    return (
      <Layout>
        <div className="px-4 py-8 text-sm text-text-secondary">
          Invalid meetup link.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="-mx-4 min-h-[min(100%,480px)] px-4 py-6 xl:-mx-7 xl:px-7 xl:py-8">
        <MeetupSessionView sessionId={sessionId} />
      </div>
    </Layout>
  );
}
