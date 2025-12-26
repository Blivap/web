import classNames from "classnames";
import { Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export const HomeLayout = (props: PropsWithChildren<unknown>) => {
  const pathName = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    return pathName.includes(href);
  };
  return (
    <div className="flex-1 pt-14.25">
      <div className="fixed top-0 z-50 bg-[#F4F2FF] pt-4 flex justify-between items-center px-20 w-full">
        <div className="flex gap-5.75">
          {[
            { href: "/", label: "Donors" },
            { href: "/researchers", label: "Researchers" },
            {
              href: "/healthcare&professionals",
              label: "Healthcare professionals",
            },
            {
              href: "/working_at",
              label: "Working at",
            },
          ].map((e) => {
            const active = isActive(e.href);
            return (
              <Link
                key={`nav-link-${e.label}`}
                href={e.href}
                className={classNames(
                  "text-base text-[#171717] py-2.5 px-3.75 font-inter",
                  { "bg-white": active }
                )}
              >
                {e.label}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-5.25 ">
          <Link href="/about" className="font-inter">
            About Blivap
          </Link>
          <div>
            <div className="flex items-center font-inter">
              <p className="font-semibold flex gap-1  items-center">
                <Globe size={20} strokeWidth={1.5} /> <span> NL</span>
              </p>
              <p className="mx-2.5">|</p>
              <p className="font-semibold"> EN </p>
            </div>
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
};
