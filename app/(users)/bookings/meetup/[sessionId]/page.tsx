"use client";

import { useParams } from "next/navigation";
import { Layout } from "@/layout/layout.component";
import { MeetupSessionView } from "../components/meetup-session.view";
import { notFound } from "next/navigation";

export default function MeetupSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const raw = params?.sessionId;
  const sessionId =
    typeof raw === "string"
      ? decodeURIComponent(raw)
      : Array.isArray(raw)
        ? decodeURIComponent(raw[0] ?? "")
        : "";

  if (!sessionId) {
    return notFound();
  }

  return (
    <Layout>
      <div className="-m-4 flex min-h-0 flex-1 flex-col overflow-hidden xl:-mx-7">
        <MeetupSessionView sessionId={sessionId} />
      </div>
    </Layout>
  );
}
