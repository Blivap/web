"use client";

import { FiBell } from "react-icons/fi";
import { HomeLayout } from "./components/layout/home.layout.component";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

// import Image from "next/image";

export default function Home() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col ">
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 mt-2 flex items-center justify-between">
          <p className="font-bold font-helvetica text-primary text-xl sm:text-2xl md:text-3xl">
            Blivap
          </p>
          <div className="relative border border-[#9CA3AF] rounded-full sm:p-4 p-1 flex items-center justify-center">
            <div className="absolute size-2 bg-[#FF0000] rounded-full right-2 top-1 sm:top-4 sm:right-4.5" />
            <FiBell size={24} className="stroke-1 text-2xl" />
          </div>
        </div>
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 mt-2 flex items-center justify-between">
          <div className="hidden md:flex gap-8 ">
            {["About blood", "About donating", "What we do"].map((text, id) => (
              <p key={id}>{text}</p>
            ))}
          </div>
          <div className="relative border border-[#D9D9D9]  sm:p-2.5 p-1 flex items-center  w-full max-w-89.75">
            <input
              className="outline-none w-full text-sm sm:text-base md:text-lg font-inter placeholder:text-[#6B7280] leading-5.5"
              type="text"
              placeholder="What are you looking for"
            />
          </div>
        </div>
        <div className="mt-4.5 grid lg:grid-cols-5">
          <div className="col-span-5 lg:col-span-2 flex flex-col px-4 sm:px-8 md:px-12 lg:pl-19.5 pt-8 sm:pt-12 lg:pt-15.5 gap-6 sm:gap-8 lg:gap-11.25 min-h-100 sm:h-auto lg:h-146.75 bg-primary">
            <div className="flex flex-col gap-6">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white leading-tight sm:leading-10 md:leading-12 lg:leading-14">
                Save lives with your blood or spam
              </p>
              <Link
                className="w-fit bg-black text-white py-3.5 px-6.25"
                href="#"
              >
                Register as a donor (EN){" "}
              </Link>
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 bg-white px-4 sm:px-6 md:px-9 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-12 lg:pb-27 shadow-[0_4px_30px_#0000001A] max-w-full lg:max-w-140.5 relative w-full lg:translate-x-18 z-10">
              <p className="font-medium text-lg sm:text-xl md:text-2xl text-black">
                Quick links
              </p>
              <div className="flex flex-col gap-4">
                {["About donating", "Research", "About Blivap"].map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[#E5E7EB] pb-4"
                  >
                    <p className="text-sm sm:text-base md:text-lg">{e}</p>
                    <ArrowRight strokeWidth={1.3} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative col-span-5 lg:col-span-3 bg-green-300 min-h-146.75 overflow-hidden">
            <Image
              src="/images/hero_image.jpg"
              alt="home illustration"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            <div className="absolute w-[90%] h-6 bg-[#0005F2] -bottom-6"></div>
          </div>
        </div>
        <div className="mt-37.75 flex flex-col lg:flex-row">
          <div className="h-fit flex flex-col px-4 sm:px-8 md:px-12 lg:px-19.5 pt-8 sm:pt-12 lg:pt-15.5 gap-4 sm:gap-6 lg:gap-7.25 pb-8 sm:pb-16 lg:pb-26.75 bg-[#F4F2FF] ">
            <div className="flex flex-col gap-6">
              <p className="text-xl sm:text-2xl md:text-3xl text-black leading-tight sm:leading-8 md:leading-10">
                Together we help bring people who need Blood/Spam to people who
                are willing to donate blood/Spam
              </p>
              <p className="w-full sm:w-fit text-[#333333] text-sm sm:text-base">
                Blivap stands for life. For people. For making a difference at
                these moments when it really matters. Thanks to our dedicated
                donors, patients get a chance at a better future and you also
                get a better life by donating.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 lg:px-[17.7px] bg-primary"
              >
                Become a donor
              </Link>
              <Link
                href="#"
                className="border-2 border-black py-2.5 sm:py-3 px-3 sm:px-4 lg:px-[17.7px] w-fit text-[#333333] text-sm sm:text-base"
              >
                Read more
              </Link>
            </div>
          </div>
          <div className="relative  bg-white  lg:-translate-x-10 lg:translate-y-8.25 flex flex-col gap-16.5 w-full">
            <div className="flex flex-col gap-8 sm:gap-12 lg:gap-20.5 mt-8 sm:mt-12 lg:mt-15 max-w-full px-4 sm:pl-8 lg:pl-14.5 ">
              <div className="flex flex-col gap-4">
                <p className="text-lg sm:text-xl md:text-2xl font-medium leading-5.5">
                  Your donation
                </p>
                <p className="font-medium text-sm sm:text-base leading-5.5">
                  Tell the story of hope, recovery and future
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-lg sm:text-xl md:text-2xl font-medium leading-5.5">
                  About Blivap
                </p>
                <p className="font-medium text-sm sm:text-base leading-5.5">
                  In a world full of charge, we continue to deliver safe blood
                  products
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-lg sm:text-xl md:text-2xl font-medium leading-5.5">
                  Lifesaving research
                </p>
                <p className="font-medium text-sm sm:text-base leading-5.5">
                  Life saving blood products, therapeutics, services,
                  diagnostics and knowledge for health care
                </p>
              </div>
            </div>
            <div className="flex gap-2.25 items-center ml-4 sm:ml-6 lg:ml-6.25 sm:mb-5 lg:mb-5.25">
              <p className="text-primary font-medium text-sm sm:text-base">
                What we do
              </p>{" "}
              <ArrowRight className="text-primary" size={16} />
            </div>
          </div>
        </div>
        <div className="mt-37.75 grid lg:grid-cols-5">
          <div className="z-10 col-span-5 lg:col-span-2 bg-[#F9E8EE] w-full lg:w-177 lg:translate-y-8.25 flex flex-col gap-8 sm:gap-12 lg:gap-16.5 px-4 sm:px-8 md:px-12 lg:px-19.75 pt-8 sm:pt-16 md:pt-24 lg:pt-30 pb-8 sm:pb-16 md:pb-24 lg:pb-29.5">
            <p className="font-medium text-xl sm:text-2xl md:text-3xl lg:text-[32px]">
              Save a Life
            </p>
            <div className="flex flex-col gap-8">
              <p className="text-sm sm:text-base text-[#333333] font-medium">
                Nigeria has a lack of blood crises, this issue is the cause of
                many deaths and we as an organization decided to fix that
                problem by creating Blivap. Blivap helps connect two individuals
                who blood groups match and are one is willing to sell he or her
                blood to save another. We as Blivap also help connects people in
                need of sperm donors.
              </p>
              <div className="flex gap-2.25 items-center ">
                <p className="text-primary font-medium text-sm sm:text-base">
                  About donating
                </p>
                <ArrowRight className="text-primary" size={16} />
              </div>
            </div>
          </div>
          <div className="col-span-5 lg:col-span-3 relative z-0 min-h-100 overflow-hidden">
            <Image
              src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
              alt="blood pressure"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
        </div>
        <div className="mt-8 sm:mt-16 lg:mt-23.25 flex flex-col gap-6 sm:gap-8 lg:gap-9 px-4 sm:px-8 md:px-12  mx-auto">
          <p className="font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-tight sm:leading-6 md:leading-8 lg:leading-[22.4px]">
            News
          </p>
          <div className="flex flex-col justify-between gap-8.5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative w-full  overflow-hidden">
                <Image
                  className="w-full h-full object-cover"
                  src="/images/black_woman.jpg"
                  alt="News image"
                  width={647}
                  height={456}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-4 sm:bottom-7 left-1 w-[90%] sm:w-full sm:left-6 lg:left-6.25 bg-white pt-3 sm:pt-4 lg:pt-5 pl-3 sm:pl-4 lg:pl-4.25 pr-3 sm:pr-4 max-w-full sm:max-w-77 z-10">
                  <div className="flex items-center gap-2.75">
                    <p className="py-[1.5px] px-[7.5px] bg-[#F4F2FF] text-[#6B7280]">
                      News
                    </p>
                    <p className="font-medium text-sm text-[#6B7280]">
                      9 December 2025
                    </p>
                  </div>
                  <p className="mt-1.5 sm:text-lg  md:text-2xl leading-tight sm:leading-6 md:leading-6.5 tracking-[-0.41px]">
                    Nigeria invest in blood pushing the idea and saving more
                    life.{" "}
                  </p>
                  <div className="flex gap-2.25 items-center mt-4 sm:mt-6 md:mt-10 mb-3 sm:mb-4 md:mb-4.75">
                    <p className="text-primary font-medium text-xs sm:text-sm md:text-base">
                      Read news
                    </p>
                    <ArrowRight className="text-primary" size={16} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-9.75">
                {[
                  {
                    description:
                      "Nigerian- Medical system just release the cure for HIV",
                    url: "https://i.pinimg.com/1200x/36/b9/b6/36b9b6b9f82b4a9dc290f40c25dccebe.jpg",
                  },
                  {
                    description: "Scientists discover new mechanism regulating",
                    url: "https://i.pinimg.com/1200x/36/b9/b6/36b9b6b9f82b4a9dc290f40c25dccebe.jpg",
                  },
                  {
                    description:
                      "Scientists discover prevention for Malaria and Fever",
                    url: "https://i.pinimg.com/1200x/36/b9/b6/36b9b6b9f82b4a9dc290f40c25dccebe.jpg",
                  },
                ].map((title, id) => (
                  <div
                    key={id}
                    className="flex flex-col sm:flex-row gap-4 shadow-[0_4px_20px_#00000026]"
                  >
                    <Image
                      className=" w-full md:w-56.5  h-33.75 object-cover"
                      src={title.url}
                      alt="news image"
                      width={226}
                      height={135}
                      sizes="(max-width: 226px) 100vw, 50vw"
                    />

                    <div className="flex flex-col p-3 pb-3.75  sm:pr-6 lg:pr-9.25">
                      <div className="flex flex-col gap-2">
                        <p className="font-medium text-sm text-[#6B7280]">
                          9 December 2025
                        </p>
                        <p className="text-sm sm:text-base font-medium">
                          {title.description}
                        </p>
                      </div>
                      <div className="flex gap-2.25 items-center ">
                        <p className="text-primary font-medium text-xs sm:text-sm md:text-base">
                          Read news
                        </p>
                        <ArrowRight className="text-primary" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="#"
              className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 lg:px-[17.7px] bg-primary"
            >
              Read more
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
