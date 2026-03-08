"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const newsItems = [
  {
    id: 1,
    title: "Nigeria invests in blood donation, saving more lives",
    date: "9 Dec 2025",
    category: "News",
    image: "/images/black_woman.jpg",
    featured: true,
    excerpt:
      "The Nigerian healthcare system has made significant strides in promoting blood donation awareness.",
  },
  {
    id: 2,
    title: "Nigerian medical system releases breakthrough in HIV research",
    date: "9 Dec 2025",
    category: "Medical",
    image: "/images/news_image.jpg",
    excerpt: "Latest developments in treatment and prevention.",
  },
  {
    id: 3,
    title: "Scientists discover new mechanism regulating blood cell production",
    date: "9 Dec 2025",
    category: "Research",
    image: "/images/news_image.jpg",
    excerpt: "Findings could improve donation and transfusion outcomes.",
  },
  {
    id: 4,
    title: "Prevention advances for Malaria and Fever",
    date: "9 Dec 2025",
    category: "Research",
    image: "/images/news_image.jpg",
    excerpt: "New approaches to disease prevention in the region.",
  },
];

export default function News() {
  const featured = newsItems.find((i) => i.featured);
  const more = newsItems.filter((i) => !i.featured);

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto">
        <header className="mb-8">
          <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight">
            News
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Updates and stories from Blivap and healthcare.
          </p>
        </header>

        {/* Featured article */}
        {featured && (
          <article className="mb-10">
            <Link
              href="#"
              className="group flex flex-col sm:flex-row rounded-xl border border-[#E5E7EB] bg-white overflow-hidden hover:border-[#D1D5DB] hover:shadow-md transition-all"
            >
              <div className="relative w-full sm:w-2/5 min-h-[200px] sm:min-h-0 sm:aspect-4/3 shrink-0">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 40vw"
                />
              </div>
              <div className="flex flex-col justify-center p-4 sm:p-6 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-medium">
                  {featured.category}
                </span>
                <h2 className="mt-1.5 text-base sm:text-lg font-semibold text-black leading-snug group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <time
                  className="mt-1 text-[10px] text-[#9CA3AF]"
                  dateTime="2025-12-09"
                >
                  {featured.date}
                </time>
                {featured.excerpt && (
                  <p className="mt-2 text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                    {featured.excerpt}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                  Read article
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          </article>
        )}

        {/* More articles – list layout */}
        <section>
          <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
            More articles
          </h2>
          <ul className="flex flex-col divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl bg-white overflow-hidden">
            {more.map((item) => (
              <li key={item.id}>
                <Link
                  href="#"
                  className="group flex flex-col sm:flex-row gap-3 p-4 hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="relative w-full sm:w-24 h-20 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-[#F3F4F6]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#9CA3AF]">
                      {item.date}
                    </span>
                    <h3 className="mt-0.5 text-sm font-semibold text-black leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {"excerpt" in item && item.excerpt && (
                      <p className="mt-1 text-xs text-[#6B7280] line-clamp-1">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="self-start sm:self-center shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity">
                    Read
                    <ArrowRight size={12} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </HomeLayout>
  );
}
