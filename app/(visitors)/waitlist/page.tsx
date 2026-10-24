import { HomeLayout } from "@/layout/home.layout.component";
import { Suspense } from "react";
import { WaitlistJoin } from "./waitlist-join";

export default function WaitlistPage() {
  return (
    <HomeLayout>
      <Suspense
        fallback={
          <div className="py-16 text-sm text-text-secondary">
            Loading waitlist…
          </div>
        }
      >
        <WaitlistJoin />
      </Suspense>
    </HomeLayout>
  );
}
