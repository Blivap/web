"use client";

const STEPS = [
  { id: 1, label: "Blood type & location" },
  { id: 2, label: "Health questionnaire" },
  { id: 3, label: "Next steps" },
];

const pulse = "bg-[#E5E7EB] dark:bg-white/12 animate-pulse rounded-md";

function SkeletonStepProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav className="flex flex-col relative gap-2 mb-8 w-full" aria-hidden>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
        {STEPS.map((s) => {
          const isActive = s.id === currentStep;
          const isPast = s.id < currentStep;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 ${isActive ? "flex" : "hidden sm:flex"}`}
            >
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <div className="flex items-center gap-1">
                  <div
                    className={`inline-flex size-[13px] rounded-full shrink-0 ${
                      isActive
                        ? "bg-primary/40"
                        : isPast
                          ? "bg-primary/30"
                          : `${pulse} w-[13px] h-[13px] !rounded-full`
                    }`}
                  />
                  <div className={`h-3 w-9 ${pulse}`} />
                </div>
                <div
                  className={`h-4 max-w-[180px] rounded ${
                    isActive ? `sm:max-w-none ${pulse} w-40` : `${pulse} w-32`
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="absolute bg-primary/35 h-[3px] bottom-0 left-0 transition-all duration-700 ease-in-out hidden sm:block rounded-sm"
        style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
      />
      <div className="w-full h-[3px] bg-border hidden sm:block rounded-sm overflow-hidden" />
    </nav>
  );
}

/**
 * Mirrors `/donors/new` step 1 layout (progress + blood type & location) while
 * `GET /donors/me` hydrates profile state.
 */
export function NewDonorPageSkeleton() {
  return (
    <div
      className="sm:p-6 w-full flex flex-col flex-1 h-full grow"
      aria-busy="true"
      aria-live="polite"
    >
      <SkeletonStepProgress currentStep={1} />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-6 mt-6 xl:mt-10">
          <div>
            <div className={`h-7 w-56 mb-2 ${pulse}`} />
            <div className="space-y-2 max-w-[600px]">
              <div className={`h-4 w-full ${pulse}`} />
              <div className={`h-4 w-full ${pulse}`} />
              <div className={`h-4 w-[88%] ${pulse}`} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`h-4 w-28 ${pulse}`} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-md border border-border bg-[#F3F4F6] dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 bg-[#F9FAFB] dark:bg-white/5 space-y-4">
            <div className={`h-4 w-52 ${pulse}`} />
            <div className="space-y-2">
              <div className={`h-3 w-full ${pulse}`} />
              <div className={`h-3 w-full ${pulse}`} />
              <div className={`h-3 w-[70%] ${pulse}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className={`h-3 w-14 mb-1 ${pulse}`} />
                <div className="h-10 w-full rounded-lg border border-border bg-white dark:bg-[#1a1a22] animate-pulse" />
              </div>
              <div>
                <div className={`h-3 w-24 mb-1 ${pulse}`} />
                <div className="h-10 w-full rounded-lg border border-border bg-white dark:bg-[#1a1a22] animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className={`h-3 w-20 mb-1 ${pulse}`} />
                <div className="h-10 w-full rounded-lg border border-border bg-white dark:bg-[#1a1a22] animate-pulse" />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <div className="h-10 w-full rounded-lg border border-primary/35 bg-white dark:bg-[#1a1a22] animate-pulse" />
              </div>
            </div>
          </div>

          <div
            className={`h-10 w-36 rounded-md ${pulse} bg-primary/25 dark:bg-primary/20`}
          />
        </div>
      </div>

      <span className="sr-only">Loading your donor registration</span>
    </div>
  );
}
