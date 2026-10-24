import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { MeetupBootstrapClient } from "./components/meetup-bootstrap.client";
import { MeetupPageSkeleton } from "./components/meetup-page-skeleton.component";

export default function MeetupFromBookingPage() {
  return (
    <Layout>
      <div className="-m-4 flex min-h-0 flex-1 flex-col overflow-hidden xl:-mx-7">
        <Suspense fallback={<MeetupPageSkeleton />}>
          <MeetupBootstrapClient />
        </Suspense>
      </div>
    </Layout>
  );
}
