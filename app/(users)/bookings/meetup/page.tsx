import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { MeetupBootstrapClient } from "./components/meetup-bootstrap.client";
import { MeetupPageSkeleton } from "./components/meetup-page-skeleton.component";

export default function MeetupFromBookingPage() {
  return (
    <Layout>
      <div className="-mx-4 min-h-[min(100%,480px)] px-4 py-6 xl:-mx-7 xl:px-7 xl:py-8">
        <Suspense fallback={<MeetupPageSkeleton />}>
          <MeetupBootstrapClient />
        </Suspense>
      </div>
    </Layout>
  );
}
