"use client";

import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { BookingsListView } from "./components/bookings-list.view";
import { BookingsShellSkeleton } from "./components/bookings-shell.view";
import { useAppSelector } from "@/store/hooks";

function BookingsContent() {
  const user = useAppSelector((s) => s.auth.user);

  // Auth user is client-only (/me). Same skeleton on SSR + first paint avoids hydration mismatch.
  if (!user) {
    return <BookingsShellSkeleton />;
  }

  return <BookingsListView />;
}

export default function BookingsPage() {
  return (
    <Layout>
      <div className="flex w-full shrink-0 flex-col pb-10">
        <Suspense fallback={<BookingsShellSkeleton />}>
          <BookingsContent />
        </Suspense>
      </div>
    </Layout>
  );
}
