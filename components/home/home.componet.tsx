"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { HomeLayout } from "../../layout/home.layout.component";
import { NewsFallbackImage } from "../image/news-fallback-image.component";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import { formatNewsPublishedDate } from "@/lib/news-date";
import { useNews } from "@/hooks/news/useNews.hooks";
import { gsap } from "gsap";
import { BlivapLogo } from "@/public/svg";
import { Button } from "../ui/button";
import { InViewMount, useInView } from "@/components/in-view";

function NewsFeatureSkeleton() {
  return (
    <div className="relative w-full min-h-48 overflow-hidden bg-[#E5E7EB] animate-pulse dark:bg-[#1F2937] sm:min-h-100">
      <div className="absolute inset-0 bg-linear-to-br from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB] dark:from-[#1F2937] dark:via-[#111827] dark:to-[#1F2937]" />
      <div className="absolute bottom-0 left-0 right-0 m-[25px] max-w-[308px] bg-white/95 p-3 backdrop-blur-sm dark:bg-[#111827]/90 sm:p-4">
        <div className="h-3 w-28 rounded-full bg-[#D1D5DB] dark:bg-slate-600" />
        <div className="mt-2 h-4 w-full rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
        <div className="mt-2 h-4 w-4/5 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
        <div className="mt-3 h-3 w-20 rounded-full bg-[#F3D5DB] dark:bg-primary/30" />
      </div>
    </div>
  );
}

function NewsCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 shadow-[0px_4px_20px_#00000026] animate-pulse dark:shadow-[0_20px_40px_rgba(0,0,0,0.28)] sm:flex-row sm:gap-3">
      <div className="h-[135px] w-full shrink-0 bg-[#E5E7EB] dark:bg-[#1F2937] sm:w-[266px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 py-[11px] md:px-0">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded-full bg-[#D1D5DB] dark:bg-slate-600" />
          <div className="h-3.5 w-full rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
          <div className="h-3.5 w-5/6 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
        </div>
        <div className="mt-1 h-3 w-16 rounded-full bg-[#F3D5DB] dark:bg-primary/30" />
      </div>
    </div>
  );
}

export const HomeComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const newsListRef = useRef<HTMLDivElement>(null);
  const [newsSectionRef, newsSectionNear] = useInView<HTMLDivElement>({
    rootMargin: "320px 0px",
    once: true,
  });

  const homeNewsParams = useMemo(
    () => ({
      q: "blood donation",
      language: "en" as const,
      size: 4,
    }),
    [],
  );

  const { news, isLoading, isRateLimited } = useNews(homeNewsParams, {
    enabled: newsSectionNear,
  });

  const featuredNews = news?.[0];
  const newsItems = useMemo(() => news?.slice(1, 4) ?? [], [news]);
  const showNewsPlaceholder = !newsSectionNear || isLoading;

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(["[data-hero-copy]", "[data-hero-image]", "[data-hero-links]"], {
        opacity: 0,
      });

      const isMdUp =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 768px)").matches;

      const scrollSections = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(
          "[data-home-scroll-section]",
        ) ?? [],
      );

      scrollSections.forEach((section) => {
        const targets = Array.from(
          section.querySelectorAll<HTMLElement>("[data-home-scroll-item]"),
        );

        if (targets.length === 0) return;

        targets.forEach((target) => {
          gsap.set(target, {
            opacity: 0,
            x: 0,
            y: 28,
            willChange: "opacity, transform",
          });
        });
      });

      gsap.fromTo(
        "[data-hero-copy]",
        { y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        "[data-hero-links]",
        { y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.18,
        },
      );

      gsap.fromTo(
        "[data-hero-image]",
        { x: 36, scale: 1.03 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.08,
        },
      );

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleSections = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target as HTMLElement);

          if (visibleSections.length === 0) return;

          visibleSections.forEach((section) => {
            observer.unobserve(section);

            const targets = Array.from(
              section.querySelectorAll<HTMLElement>("[data-home-scroll-item]"),
            );

            if (targets.length === 0) return;

            targets.forEach((target, index) => {
              const settleX = isMdUp
                ? Number(target.dataset.homeScrollSettleX ?? 0)
                : 0;
              const settleY = isMdUp
                ? Number(target.dataset.homeScrollSettleY ?? 0)
                : 0;

              const tl = gsap.timeline({
                delay: index * 0.12,
                defaults: { overwrite: "auto" },
                onComplete: () => {
                  gsap.set(target, {
                    clearProps:
                      settleX === 0 && settleY === 0
                        ? "opacity,transform,will-change"
                        : "opacity,will-change",
                  });
                },
              });

              tl.to(target, {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.58,
                ease: "power2.out",
              });

              if (settleX !== 0 || settleY !== 0) {
                tl.to(target, {
                  x: settleX,
                  y: settleY,
                  duration: 0.34,
                  ease: "power1.inOut",
                });
              }
            });
          });
        },
        {
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.16,
        },
      );

      scrollSections.forEach((section) => observer.observe(section));

      return () => {
        observer.disconnect();
      };
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (showNewsPlaceholder || !newsListRef.current) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const items = Array.from(
      newsListRef.current.querySelectorAll<HTMLElement>(
        "[data-home-news-list-item]",
      ),
    );

    if (items.length === 0) return;

    gsap.killTweensOf(items);
    gsap.set(items, {
      opacity: 0,
      x: 56,
      y: 24,
      scale: 0.965,
      rotateZ: -1.2,
      willChange: "opacity, transform",
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        gsap.to(items, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotateZ: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.22,
          clearProps: "opacity,transform,will-change",
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.24,
      },
    );

    observer.observe(newsListRef.current);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(items);
    };
  }, [newsItems, showNewsPlaceholder]);

  return (
    <HomeLayout>
      <div
        ref={containerRef}
        className="mx-auto flex w-full min-[1441px]:max-w-[1440px] flex-1 flex-col gap-6 sm:gap-8 md:gap-12"
      >
        <header className="mx-auto mt-4 w-full max-w-[1440px] px-3.5 sm:mt-6 sm:px-6 md:px-8 2xl:px-0 min-[1440px]:px-0 min-[1441px]:max-w-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
            <div className="flex flex-col items-start gap-0.5 shrink-0">
              <Link href="/" className="w-fit" data-register-logo>
                <p className="flex justify-center font-semibold font-helvetica text-primary text-5xl tracking-tight">
                  <BlivapLogo fill="#960018" className="size-17" />
                  <span className="-mt-1 -ml-4">livap</span>
                </p>
              </Link>
              <span className="text-[10px] font-medium tracking-wide text-[#6B7280] uppercase dark:text-slate-400 sm:text-xs">
                Connecting generosity to real impact.
              </span>
            </div>
            <div className="flex items-center gap-px sm:gap-2">
              <Button
                variant="link"
                href="/login"
                className="text-xs font-medium py-2  px-6 rounded-full bg-primary text-white hover:bg-primary/90 hover:text-white! transition-colors"
              >
                Login
              </Button>
              <Button variant="link" href="/register">
                Register
              </Button>
            </div>
          </div>
        </header>
        <div className=" grid grid-cols-1 md:grid-cols-12">
          <div className="relative z-1 col-span-1 flex min-h-80 w-full flex-col gap-4 bg-primary px-4 pt-6 sm:min-h-96 sm:gap-6 sm:px-8 sm:pt-8 md:col-span-6 md:h-112 md:gap-8 md:pt-10 xl:pl-36 dark:bg-[#7A0014]">
            <div data-hero-copy className="flex flex-col gap-3 sm:gap-4">
              <p className="text-lg sm:text-xl md:text-2xl text-white leading-snug font-medium">
                Save lives with your blood or sperm
              </p>
              <Button
                variant="link"
                href="/login"
                className="w-fit bg-black hover:bg-black/60 hover:text-white! text-white text-xs font-medium   rounded-md transition-colors px-6 "
              >
                Login
              </Button>
            </div>
            <div
              data-hero-links
              className="relative z-10 mt-2 flex w-full max-w-150 flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 pt-4 pb-5 shadow-sm dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:mt-0 sm:px-5 sm:pt-5 sm:pb-6 md:px-6"
            >
              <p className="mb-1 text-sm font-semibold text-black dark:text-white">
                Quick links
              </p>
              <div className="flex flex-col gap-0">
                {[
                  { label: "About donating", href: "/about-donating" },
                  { label: "Research", href: "/research" },
                  { label: "About Blivap", href: "/about" },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="group flex items-center justify-between border-b border-[#E5E7EB] py-2.5 text-xs font-medium text-[#374151] transition-colors last:border-0 hover:text-primary dark:border-white/10 dark:text-slate-300 dark:hover:text-primary"
                  >
                    {item.label}
                    <ArrowRight
                      size={14}
                      strokeWidth={1.5}
                      className="group-hover:translate-x-0.5 transition-transform opacity-70"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div
            data-hero-image
            className="relative col-span-1 md:col-span-6 min-h-75 sm:min-h-100 -ml-10 z-0 "
          >
            <InViewMount
              className="absolute inset-0"
              rootMargin="240px 0px"
              fallback={
                <div
                  className="absolute inset-0 animate-pulse bg-white/10 dark:bg-white/5"
                  aria-hidden
                />
              }
            >
              <Image
                src="/images/hero_image.jpg"
                alt="home illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                decoding="async"
              />
            </InViewMount>
            <div className="pointer-events-none absolute -bottom-2 h-2 w-[95%] bg-[#0005F2] dark:bg-[#4338CA] sm:-bottom-3 sm:h-3" />
          </div>
        </div>

        <div
          data-home-scroll-section
          className="mt-6 sm:mt-12 grid grid-cols-1 md:grid-cols-5"
        >
          <div
            data-home-scroll-item
            className="col-span-1 flex max-w-full flex-col gap-4 border border-[#E5E7EB] border-l-0 bg-[#F9FAFB] px-4 py-20 pr-4 dark:border-white/10 dark:bg-[#0F172A] sm:gap-5 sm:px-8 sm:pr-6 md:col-span-3 md:pr-16 xl:pl-36"
          >
            <p className="max-w-100 text-base font-semibold leading-snug text-black dark:text-white sm:text-xl">
              Together we help connect people who need blood or sperm with
              willing donors.
            </p>
            <p className="max-w-xl text-xs leading-relaxed text-[#6B7280] dark:text-slate-400 sm:text-sm">
              Blivap stands for life. For people. For making a difference when
              it really matters. Thanks to our donors, patients get a chance at
              a better future.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="link"
                href="/login"
                className="text-xs font-medium py-2 px-4  bg-primary text-white hover:bg-primary/90 hover:text-white! transition-colors"
              >
                Login
              </Button>
              <Button variant="outline" href="/about">
                Read more
              </Button>
            </div>
          </div>
          <div
            data-home-scroll-item
            data-home-scroll-settle-x="-16"
            data-home-scroll-settle-y="16"
            className="relative col-span-1 mt-6 flex flex-col gap-6 border border-[#E5E7EB] bg-white px-4 py-6 dark:border-white/10 dark:bg-[#111827] md:col-span-2 md:mt-0 md:-translate-x-4 md:translate-y-4 md:border-r-0 md:px-5 sm:px-6"
          >
            {[
              {
                title: "Your donation",
                desc: "Hope, recovery and future.",
                href: "/about-donating",
              },
              {
                title: "About Blivap",
                desc: "Safe blood products and donor connections.",
                href: "/about",
              },
              {
                title: "Lifesaving research",
                desc: "Therapeutics, diagnostics and care.",
                href: "/research",
              },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex flex-col gap-1 hover:opacity-90 transition-opacity"
              >
                <p className="text-sm font-semibold text-black dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">
                  {item.desc}
                </p>
              </Link>
            ))}
            <Link
              href="/what-we-do"
              className="flex gap-1.5 items-center w-fit text-primary font-medium text-xs mt-2 hover:underline"
            >
              What we do
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div
          data-home-scroll-section
          className="mt-6 sm:mt-12  grid grid-cols-1 md:grid-cols-12"
        >
          <div
            data-home-scroll-item
            data-home-scroll-settle-y="16"
            className="z-10 col-span-1 flex w-full flex-col gap-4 border border-[#FCE7E7] bg-[#FDF2F4] px-4 py-20 pr-20 dark:border-primary/20 dark:bg-[#2A1117] md:col-span-5 md:translate-y-4 sm:px-8 xl:w-160 xl:pl-36"
          >
            <p className="text-base font-semibold text-black dark:text-white sm:text-lg">
              Save a life
            </p>
            <p className="text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
              Nigeria faces a serious blood shortage crisis, and this issue
              leads to many preventable deaths every year. As an organization,
              we created Blivap to help address this problem. Blivap connects
              individuals whose blood groups match, allowing willing donors to
              help save lives. In addition, Blivap helps connect people who are
              in need of sperm donors.
            </p>
            <Link
              href="/about-donating"
              className="flex gap-1.5 items-center w-fit text-primary font-medium text-xs hover:underline"
            >
              About donating
              <ArrowRight size={14} />
            </Link>
          </div>
          <div
            data-home-scroll-item
            className="col-span-1 md:col-span-7 relative z-0 min-h-75 sm:min-h-100"
          >
            <InViewMount
              className="absolute inset-0"
              rootMargin="200px 0px"
              fallback={
                <div
                  className="absolute inset-0 animate-pulse bg-[#FCE7E7] dark:bg-[#2A1117]"
                  aria-hidden
                />
              }
            >
              <Image
                src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
                alt="Doctor supporting a patient"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 58vw"
                loading="lazy"
                decoding="async"
              />
            </InViewMount>
          </div>
        </div>
        <div
          ref={newsSectionRef}
          data-home-scroll-section
          className="mx-4 mt-6 flex flex-col gap-4 sm:mx-6 sm:mt-8 md:mx-12 md:mt-10 2xl:mx-0"
        >
          <p
            data-home-scroll-item
            className="text-lg font-semibold text-black dark:text-white sm:text-xl"
          >
            News
          </p>
          <div className="flex flex-col gap-4">
            {isRateLimited ? (
              <div
                data-home-scroll-item
                className="flex flex-col gap-4 rounded-2xl border border-[#F3D5DB] bg-[#FFF7F8] p-5 dark:border-primary/20 dark:bg-[#241217] sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-primary/10 p-3 text-primary dark:bg-primary/15">
                    <Newspaper size={18} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold text-black dark:text-white">
                      Daily news updates will be back soon
                    </p>
                    <p className="max-w-2xl text-sm leading-relaxed text-[#6B7280] dark:text-slate-400">
                      We have reached today&apos;s news provider request limit.
                      Fresh health headlines will appear again after the
                      provider resets access at 00:00 UTC.
                    </p>
                  </div>
                </div>
                <Link
                  href="/about-donating"
                  className="w-fit text-white text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 rounded-none! inline-block transition-colors"
                >
                  Learn more about donating
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div data-home-scroll-item>
                    {showNewsPlaceholder ? (
                      <NewsFeatureSkeleton />
                    ) : (
                      <div className="relative w-full min-h-48 sm:min-h-100">
                        <InViewMount
                          className="absolute inset-0"
                          rootMargin="160px 0px"
                          fallback={
                            <div
                              className="absolute inset-0 animate-pulse bg-[#E5E7EB] dark:bg-[#1F2937]"
                              aria-hidden
                            />
                          }
                        >
                          <NewsFallbackImage
                            src={featuredNews?.image}
                            alt={featuredNews?.title || "News"}
                            sizes="(max-width: 1280px) 100vw, 50vw"
                          />
                        </InViewMount>
                        <div className="absolute bottom-0 left-0 right-0 m-[25px] max-w-[308px] bg-white/95 p-3 backdrop-blur-sm dark:bg-[#111827]/90 sm:p-4">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B7280] dark:text-slate-400">
                            News ·{" "}
                            {formatNewsPublishedDate(
                              featuredNews?.publishedAt,
                              "9 Dec 2025",
                            )}
                          </p>
                          <p className="mt-1 max-h-20 overflow-y-auto text-sm font-medium leading-snug text-black dark:text-white">
                            {featuredNews?.description ||
                              "Nigeria invests in blood initiatives, saving more lives."}
                          </p>
                          <Link
                            href={featuredNews?.url || "/news"}
                            className="inline-flex items-center gap-1 mt-2 text-primary font-medium text-xs hover:underline"
                          >
                            Read news <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={newsListRef} className="flex flex-col gap-3 flex-1">
                    {showNewsPlaceholder
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <div key={index}>
                            <NewsCardSkeleton />
                          </div>
                        ))
                      : newsItems.map((e) => (
                          <div
                            key={e.id}
                            data-home-news-list-item
                            className="flex flex-col gap-2 shadow-[0px_4px_20px_#00000026] transition-shadow duration-200 hover:border-[#D1D5DB] active:shadow-none dark:shadow-[0_20px_40px_rgba(0,0,0,0.28)] sm:flex-row sm:gap-3"
                          >
                            <div className="relative w-full sm:w-[266px] h-[135px] shrink-0">
                              <InViewMount
                                className="absolute inset-0"
                                rootMargin="120px 0px"
                                fallback={
                                  <div
                                    className="absolute inset-0 animate-pulse bg-[#E5E7EB] dark:bg-[#1F2937]"
                                    aria-hidden
                                  />
                                }
                              >
                                <NewsFallbackImage
                                  src={e.image}
                                  alt={e.title || "News"}
                                  fallbackSrc="/images/news_image.jpg"
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, 266px"
                                />
                              </InViewMount>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 py-[11px] md:px-2">
                              <div className="flex flex-col gap-2">
                                <p className="text-xs text-[#6B7280] dark:text-slate-400">
                                  {formatNewsPublishedDate(
                                    e.pubDate,
                                    "9 December 2025",
                                  )}
                                </p>
                                <p className="line-clamp-2 text-xs font-medium text-black dark:text-white">
                                  {e.description}
                                </p>
                              </div>
                              <Link
                                href={e.url}
                                className="text-primary font-medium text-xs mt-1 hover:underline w-fit"
                              >
                                Read news
                              </Link>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
                {showNewsPlaceholder ? (
                  <div
                    data-home-scroll-item
                    className="h-8 w-24 rounded-sm bg-[#E5E7EB] animate-pulse dark:bg-[#1F2937]"
                  />
                ) : (
                  <Link
                    data-home-scroll-item
                    href="/news"
                    className="w-fit text-white text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 rounded-none! inline-block transition-colors"
                  >
                    Read more
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};
