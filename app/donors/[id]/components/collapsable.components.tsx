"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/button/button.component";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";

interface CollapsableProps {
  isOpen?: boolean;
}

export const Collapsable = ({ isOpen: initialIsOpen }: CollapsableProps) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (!isOpen) {
      gsap.set(el, { height: 0, overflow: "hidden" });
    }
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    const chevron = chevronRef.current;
    if (!el) return;

    if (!hasMounted.current) {
      hasMounted.current = true;
      if (chevron) {
        gsap.set(chevron, {
          rotation: isOpen ? 0 : 180,
          transformOrigin: "50% 50%",
        });
      }
      return;
    }

    if (chevron) {
      gsap.to(chevron, {
        rotation: isOpen ? 0 : 180,
        duration: 0.35,
        ease: "power2.out",
        transformOrigin: "50% 50%",
      });
    }

    gsap.killTweensOf(el);

    if (isOpen) {
      gsap.fromTo(
        el,
        { height: 0, overflow: "hidden" },
        {
          height: "auto",
          duration: 0.45,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(el, { clearProps: "overflow" });
          },
        },
      );
    } else {
      gsap.set(el, { overflow: "hidden" });
      gsap.to(el, {
        height: 0,
        duration: 0.35,
        ease: "power3.inOut",
      });
    }
  }, [isOpen]);

  return (
    <div className="rounded-lg border border-[#F5F5F4] bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#14141a]"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="collapsible-health-panel"
        id="collapsible-health-trigger"
      >
        <div className="flex items-center gap-2">
          <div className="size-2 shrink-0 rounded-full bg-primary" />
          <p className="text-xs font-medium text-text-primary">
            GENERAL HEALTH & LIFE STYLE
          </p>
        </div>
        <ChevronDown
          ref={chevronRef}
          className="size-4 shrink-0 text-text-tertiary"
          aria-hidden
        />
      </button>

      <div
        id="collapsible-health-panel"
        role="region"
        aria-labelledby="collapsible-health-trigger"
        ref={contentRef}
      >
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-10">
          <div className="flex w-full flex-col gap-3">
            <p className="text-xs font-semibold text-text-primary">
              Are you between 18 and 64 years old?
            </p>
            <div className="flex w-full gap-2">
              <Button
                variant={false ? "secondary" : "primary"}
                className={classNames("py-2! w-full text-xs font-normal")}
              >
                yes
              </Button>
              <Button
                variant={true ? "secondary" : "primary"}
                className="py-2! w-full text-xs font-normal"
              >
                no
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3">
            <p className="text-xs font-semibold text-text-primary">
              Are you between 18 and 64 years old?
            </p>
            <div className="flex w-full gap-2">
              <Button
                variant={false ? "secondary" : "primary"}
                className={classNames("py-2! w-full text-xs font-normal")}
              >
                yes
              </Button>
              <Button
                variant={true ? "secondary" : "primary"}
                className="py-2! w-full text-xs font-normal"
              >
                no
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3">
            <p className="text-xs font-semibold text-text-primary">
              Are you between 18 and 64 years old?
            </p>
            <div className="flex w-full gap-2">
              <Button
                variant={false ? "secondary" : "primary"}
                className={classNames("py-2! w-full text-xs font-normal")}
              >
                yes
              </Button>
              <Button
                variant={true ? "secondary" : "primary"}
                className="py-2! w-full text-xs font-normal"
              >
                no
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
