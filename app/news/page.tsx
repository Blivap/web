"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";

const newsItems = [
  {
    id: 1,
    title: "Nigeria invest in blood pushing the idea and saving more life.",
    date: "9 December 2025",
    category: "News",
    image: "/images/black_woman.jpg",
    featured: true
  },
  {
    id: 2,
    title: "Nigerian- Medical system just release the cure for HIV",
    date: "9 December 2025",
    image: "/images/news_image.jpg"
  },
  {
    id: 3,
    title: "Scientists discover new mechanism regulating",
    date: "9 December 2025",
    image: "/images/news_image.jpg"
  },
  {
    id: 4,
    title: "Scientists discover prevention for Malaria and Fever",
    date: "9 December 2025",
    image: "/images/news_image.jpg"
  }
];

export default function News() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </Link>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <h1 className="font-medium text-2xl sm:text-3xl md:text-4xl leading-tight sm:leading-6 md:leading-[22.4px]">News</h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            {newsItems
              .filter((item) => item.featured)
              .map((item) => (
                <div key={item.id} className="relative">
                  <Image
                    className="w-full"
                    src={item.image}
                    alt={item.title}
                    width={1200}
                    height={600}
                  />
                  <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-6 lg:left-6.25 bg-white pt-3 sm:pt-4 md:pt-5 pl-3 sm:pl-4 md:pl-4.25 pr-3 sm:pr-4 max-w-full sm:max-w-2xl z-10">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.75 mb-3 sm:mb-4">
                      <p className="py-0.5 px-2 bg-[#F4F2FF] text-[#6B7280] text-xs sm:text-sm">
                        {item.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#6B7280]" />
                        <p className="font-medium text-xs sm:text-sm text-[#6B7280]">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl leading-tight sm:leading-6 md:leading-6.5 tracking-[-0.41px] font-medium mb-3 sm:mb-4">
                      {item.title}
                    </h2>
                    <div className="flex gap-2.25 items-center">
                      <p className="text-primary font-medium text-sm sm:text-base">Read news</p>
                      <ArrowRight className="text-primary" size={14} />
                    </div>
                  </div>
                </div>
              ))}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {newsItems
                .filter((item) => !item.featured)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 sm:gap-4 shadow-[0_4px_20px_#00000026] bg-white rounded-xl overflow-hidden"
                  >
                    <div className="w-full h-40 sm:h-48 bg-gray-300 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-[#6B7280]" />
                        <p className="font-medium text-xs sm:text-sm text-[#6B7280]">
                          {item.date}
                        </p>
                      </div>
                      <h3 className="text-sm sm:text-base font-medium">{item.title}</h3>
                      <div className="flex gap-2.25 items-center mt-2">
                        <p className="text-primary font-medium text-xs sm:text-sm">Read news</p>
                        <ArrowRight className="text-primary" size={12} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

