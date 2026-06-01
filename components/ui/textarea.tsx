import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[88px] w-full resize-none rounded-md border border-[#66666659] bg-white px-4 py-2.5 text-base font-medium text-[#100F14] outline-none transition-colors placeholder:text-xs placeholder:text-[#9794AA] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 dark:border-white/12 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
