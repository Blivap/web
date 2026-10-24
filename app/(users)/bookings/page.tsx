"use client";

import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { BookingsListView } from "./components/bookings-list.view";
import { BookingsShellSkeleton } from "./components/bookings-shell.view";
import { useAppSelector } from "@/store/hooks";

function BookingsContent() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  if (token && !user) {
    return <BookingsShellSkeleton />;
  }

  return <BookingsListView />;
}

export default function BookingsPage() {
  return (
    <Layout>
      <div className="flex min-h-0 flex-col">
        <Suspense fallback={<BookingsShellSkeleton />}>
          <BookingsContent />
        </Suspense>
      </div>
    </Layout>
  );
}
