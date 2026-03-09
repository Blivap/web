"use client";
import classNames from "classnames";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.visibility = "visible";
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        duration: 0.15,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          if (el) el.style.visibility = "hidden";
        },
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      onClick={() => setIsOpen(!isOpen)}
      className="relative border border-[#9CA3AF] rounded-full p-2 flex items-center justify-center order-1 md:order-2 cursor-pointer"
    >
      <div className="absolute size-1 bg-[#FF0000] rounded-full top-2 right-3 border border-white" />
      <FiBell size={18} className="stroke-2 text-sm" />
      <span
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={classNames(
          "w-[280px] md:w-[350px] h-[400px] absolute top-10 left-0 md:left-auto md:-right-1 bg-white rounded border border-[#DADADA] shadow-[2px_3px_5px_#00000014] p-3 origin-top-right",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{ visibility: "hidden", opacity: 0, transform: "scale(0.96)" }}
      >
        <p className="text-sm font-medium text-black">Notifications</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-black">Notification 1</p>
          </div>
        </div>
      </span>
    </div>
  );
};
