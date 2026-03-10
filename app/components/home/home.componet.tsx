"use client";
import { useMemo } from "react";
import { HomeLayout } from "../layout/home.layout.component";
import { NewsFallbackImage } from "../image/news-fallback-image.component";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import { useNews } from "@/app/hooks/news/useNews.hooks";
import { format } from "date-fns";

function NewsFeatureSkeleton() {
  return (
    <div className="relative w-full min-h-48 sm:min-h-100 overflow-hidden bg-[#E5E7EB] animate-pulse">
      <div className="absolute inset-0 bg-linear-to-br from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB]" />
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 sm:p-4 max-w-[308px] m-[25px]">
        <div className="h-3 w-28 bg-[#D1D5DB] rounded-full" />
        <div className="mt-2 h-4 w-full bg-[#E5E7EB] rounded-full" />
        <div className="mt-2 h-4 w-4/5 bg-[#E5E7EB] rounded-full" />
        <div className="mt-3 h-3 w-20 bg-[#F3D5DB] rounded-full" />
      </div>
    </div>
  );
}

function NewsCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shadow-[0px_4px_20px_#00000026] animate-pulse">
      <div className="w-full sm:w-[266px] h-[135px] shrink-0 bg-[#E5E7EB]" />
      <div className="flex flex-col min-w-0 flex-1 py-[11px] px-5 md:px-0 gap-2">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-[#D1D5DB] rounded-full" />
          <div className="h-3.5 w-full bg-[#E5E7EB] rounded-full" />
          <div className="h-3.5 w-5/6 bg-[#E5E7EB] rounded-full" />
        </div>
        <div className="h-3 w-16 bg-[#F3D5DB] rounded-full mt-1" />
      </div>
    </div>
  );
}

export const HomeComponent = () => {
  const homeNewsParams = useMemo(
    () => ({
      query: "blood donation",
      lang: "en" as const,
      max: 4,
    }),
    [],
  );
  const { news, isLoading, isRateLimited } = useNews(homeNewsParams);
  const featuredNews = news?.[0];
  const newsItems = news?.slice(1, 4) ?? [];

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col gap-6 sm:gap-8 md:gap-12 w-full min-[1441px]:max-w-[1440px] min-[1441px]:mx-auto min-[1441px]:px-36">
        <header className="px-3.5 sm:px-6 md:px-8 xl:px-36 w-full max-w-[1440px] mx-auto mt-4 sm:mt-6 min-[1441px]:max-w-none min-[1441px]:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
            <Link href="/" className="flex flex-col gap-0.5 shrink-0">
              <span className="font-semibold font-helvetica text-primary text-4xl tracking-tight">
                Blivap
              </span>
              <span className="text-[10px] sm:text-xs text-[#6B7280] font-medium tracking-wide uppercase">
                Connecting generosity to real impact.
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/book-demo"
                className="text-xs font-medium py-2 px-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </header>
        <div className=" grid grid-cols-1 md:grid-cols-12">
          <div className="col-span-1 md:col-span-6 flex flex-col px-4 sm:px-8 xl:pl-36 pt-6 sm:pt-8 md:pt-10 gap-4 sm:gap-6 md:gap-8 min-h-80 sm:min-h-96 md:h-112 bg-primary   w-full">
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="text-lg sm:text-xl md:text-2xl text-white leading-snug font-medium">
                Save lives with your blood or sperm
              </p>
              <Link
                className="w-fit bg-black hover:bg-black/80 text-white text-xs font-medium py-2 px-3.5 rounded-md inline-block transition-colors"
                href="/book-demo"
              >
                Register as a donor (EN)
              </Link>
            </div>
            <div className="flex flex-col gap-3 bg-white px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6 shadow-sm max-w-150 relative w-full  z-10 mt-2 sm:mt-0 rounded-lg border border-[#E5E7EB]">
              <p className="font-semibold text-sm text-black mb-1">
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
                    className="flex items-center justify-between py-2.5 border-b border-[#E5E7EB] last:border-0 text-xs font-medium text-[#374151] hover:text-primary transition-colors group"
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
          <div className="relative col-span-1 md:col-span-6  min-h-75 sm:min-h-100 ">
            <Image
              src="/images/hero_image.jpg"
              alt="home illustration"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute w-[95%] h-2 sm:h-3 bg-[#0005F2] -bottom-2 sm:-bottom-3" />
          </div>
        </div>

        <div className="mt-6 sm:mt-12 grid grid-cols-1 md:grid-cols-5">
          <div className="col-span-1 md:col-span-3 flex flex-col px-4 sm:px-8 xl:pl-36 py-20 gap-4 sm:gap-5 pr-4 sm:pr-6 md:pr-16 bg-[#F9FAFB] border border-[#E5E7EB] border-l-0">
            <p className="text-base sm:text-xl font-semibold text-black leading-snug max-w-100">
              Together we help connect people who need blood or sperm with
              willing donors.
            </p>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-xl">
              Blivap stands for life. For people. For making a difference when
              it really matters. Thanks to our donors, patients get a chance at
              a better future.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/book-demo"
                className="w-full sm:w-fit text-white text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 rounded-md inline-block text-center transition-colors"
              >
                Book a demo
              </Link>
              <Link
                href="/book-demo"
                className="w-full sm:w-fit border border-[#D1D5DB] py-2 px-3.5 text-[#374151] hover:bg-[#F3F4F6] text-xs font-medium rounded-md transition-colors inline-block text-center"
              >
                Read more
              </Link>
            </div>
          </div>
          <div className="relative col-span-1 md:col-span-2 bg-white md:-translate-x-4 md:translate-y-4 flex flex-col gap-6 px-4 sm:px-6 md:px-5 border border-[#E5E7EB] md:border-r-0 mt-6 md:mt-0  py-6">
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
                <p className="text-sm font-semibold text-black">{item.title}</p>
                <p className="text-xs text-[#6B7280]">{item.desc}</p>
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
        <div className="mt-6 sm:mt-12  grid grid-cols-1 md:grid-cols-12">
          <div className="z-10 col-span-1 md:col-span-5 bg-[#FDF2F4] w-full xl:w-160 md:translate-y-4 flex flex-col gap-4 px-4 sm:px-8 xl:pl-36 pr-20 py-20 border border-[#FCE7E7] ">
            <p className="font-semibold text-base sm:text-lg text-black">
              Save a life
            </p>
            <p className="text-xs  text-[#6B7280] leading-relaxed">
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
          <div className="col-span-1 md:col-span-7 relative z-0 min-h-75 sm:min-h-100 ">
            <Image
              src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
              alt="blood pressure"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
        </div>
        <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col gap-4 mx-4 sm:mx-6 md:mx-12 lg:mx-36">
          <p className="font-semibold text-lg sm:text-xl text-black">News</p>
          <div className="flex flex-col gap-4">
            {isRateLimited ? (
              <div className="rounded-2xl border border-[#F3D5DB] bg-[#FFF7F8] p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-primary/10 p-3 text-primary">
                    <Newspaper size={18} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold text-black">
                      Daily news updates will be back soon
                    </p>
                    <p className="text-sm text-[#6B7280] max-w-2xl leading-relaxed">
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
                  {isLoading ? (
                    <NewsFeatureSkeleton />
                  ) : (
                    <div className="relative w-full min-h-48 sm:min-h-100">
                      <NewsFallbackImage
                        src={featuredNews?.image}
                        alt={featuredNews?.title || "News"}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 sm:p-4 max-w-[308px] m-[25px]">
                        <p className="text-[10px] uppercase tracking-wide text-[#6B7280] font-medium">
                          News ·{" "}
                          {featuredNews?.publishedAt
                            ? format(featuredNews.publishedAt, "d MMMM yyyy")
                            : "9 Dec 2025"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-black leading-snug">
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
                  <div className="flex flex-col gap-3 flex-1">
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <NewsCardSkeleton key={index} />
                        ))
                      : newsItems.map((e) => (
                          <div
                            key={e.id}
                            className="flex flex-col sm:flex-row gap-2 sm:gap-3 hover:border-[#D1D5DB] shadow-[0px_4px_20px_#00000026] active:shadow-none transition-shadow duration-200"
                          >
                            <div className="relative w-full sm:w-[266px] h-[135px] shrink-0">
                              <NewsFallbackImage
                                src={e.image}
                                alt={e.title || "News"}
                                fallbackSrc="/images/news_image.jpg"
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1 py-[11px] px-5 md:px-0 gap-2">
                              <div className="flex flex-col gap-2">
                                <p className="text-[#6B7280] text-xs">
                                  {e.publishedAt
                                    ? format(e.publishedAt, "d MMMM yyyy")
                                    : "9 December 2025"}
                                </p>
                                <p className="text-xs font-medium text-black line-clamp-2">
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
                {isLoading ? (
                  <div className="h-8 w-24 bg-[#E5E7EB] rounded-sm animate-pulse" />
                ) : (
                  <Link
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
