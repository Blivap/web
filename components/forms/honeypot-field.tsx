"use client";

import { useId } from "react";

/**
 * Hidden field bots tend to fill. People should leave it empty.
 * The server rejects the request when it has a value.
 */
export function HoneypotField() {
  const id = useId();

  return (
    <div
      className="absolute -left-[9999px] h-px w-px overflow-hidden"
      aria-hidden
    >
      <label htmlFor={id}>Company</label>
      <input
        id={id}
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
