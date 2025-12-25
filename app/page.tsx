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
        <div className="px-20 mt-2 flex items-center justify-between">
          <p className="font-bold font-helvetica text-primary text-[32px]">
            Blivap
          </p>
          <div className="relative border-[0.5px] border-[#9CA3AF] rounded-full sm:p-4 p-1 flex items-center justify-center">
            <div className="absolute size-[7.5px] bg-[#FF0000] rounded-full right-2 top-1 sm:top-4 sm:right-4.5" />
            <FiBell size={24} className="stroke-1 text-2xl" />
          </div>
        </div>
        <div className="px-20 mt-2 flex items-center justify-between">
          <div className="flex gap-8">
            {["About blood", "About donating", "What we do"].map((text, id) => (
              <p key={id}>{text}</p>
            ))}
          </div>
          <div className="relative border border-[#D9D9D9]  sm:p-2.5 p-1 flex items-center  w-full max-w-[359px]">
            <input
              className="outline-none w-full text-[18px] font-inter placeholder:text-[#6B7280] leading-[22px]"
              type="text"
              placeholder="What are you looking for"
            />
          </div>
        </div>
        <div className="mt-4.5 grid md:grid-cols-5">
          <div className="col-span-2 flex flex-col pl-[78px] pt-[62px] gap-[45px] h-[587px] bg-primary">
            <div className="flex flex-col gap-6">
              <p className="text-[48px] text-white leading-14">
                Save lives with your blood or spam
              </p>
              <Link
                className="w-fit bg-black text-white py-3.5 px-[25px]"
                href="#"
              >
                Register as a donor (EN){" "}
              </Link>
            </div>
            <div className="flex flex-col gap-6 bg-white px-9 pt-12 pb-[108px] shadow-[0_4px_30px_#0000001A] max-w-[562px] relative w-full md:translate-x-18 z-10">
              <p className="font-medium text-2xl text-black">Quick links</p>
              <div className="flex flex-col gap-4">
                {["About donating", "Research", "About Blivap"].map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[#E5E7EB] pb-4"
                  >
                    <p className="text-[18px]">{e}</p>
                    <ArrowRight strokeWidth={1.3} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative col-span-3 bg-green-300 min-h-[587px]">
            <Image src="/images/hero_image.jpg" alt="home illustration" fill />
            <div className="absolute w-[90%] h-6 bg-[#0005F2] -bottom-6"></div>
          </div>
        </div>
        <div className="mt-37.75grid md:grid-cols-5">
          <div className="col-span-3 flex flex-col pl-[78px] pt-[62px] gap-[29px] pb-[107px] pr-[90px] bg-[#F4F2FF]">
            <div className="flex flex-col gap-6">
              <p className="text-[32px] text-black leading-10">
                Together we help bring people who need Blood/Spam to people who
                are willing to donate blood/Spam
              </p>
              <p className="w-fit text-[#333333] text-base">
                Blivap stands for life. For people. For making a difference at
                these moments when it really matters. Thanks to our dedicated
                donors, patients get a chance at a better future and you also
                get a better life by donating.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary"
              >
                Become a donor
              </Link>
              <Link
                href="#"
                className="border-2 border-black py-3.5 px-[17.7px] w-fit text-[#333333] text-base"
              >
                Read more
              </Link>
            </div>
          </div>
          <div className="relative col-span-2 bg-white  -translate-x-10 translate-y-[33px] flex flex-col gap-[66px]">
            <div className="flex flex-col gap-[82px] mt-[60px] max-w-[482px] px-[58px]">
              <div className="flex flex-col gap-4">
                <p className="text-2xl font-medium">Your donation</p>
                <p className="font-medium">
                  Tell the story of hope, recovery and future
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-2xl font-medium">About Blivap</p>
                <p className="font-medium">
                  In a world full of charge, we continue to deliver safe blood
                  products
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-2xl font-medium">Lifesaving research</p>
                <p className="font-medium">
                  Life saving blood products, therapeutics, services,
                  diagnostics and knowledge for health care
                </p>
              </div>
            </div>
            <div className="flex gap-[9px] items-center ml-[25px] mb-[21px]">
              <p className="text-primary font-medium">What we do</p>{" "}
              <ArrowRight className="text-primary" size={16} />
            </div>
          </div>
        </div>
        <div className="mt-37.75 grid md:grid-cols-5">
          <div className="z-10 col-span-2 bg-[#F9E8EE] w-177 translate-y-8.25 flex flex-col gap-16.5 px-19.75 pt-30 pb-29.5">
            <p className="font-medium text-[32px]">Save a Life</p>
            <div className="flex flex-col gap-8">
              <p className="text-base text-[#333333] font-medium">
                Nigeria has a lack of blood crises, this issue is the cause of
                many deaths and we as an organization decided to fix that
                problem by creating Blivap. Blivap helps connect two individuals
                who blood groups match and are one is willing to sell he or her
                blood to save another. We as Blivap also help connects people in
                need of sperm donors.
              </p>
              <div className="flex gap-2.25 items-center ">
                <p className="text-primary font-medium">About donating</p>
                <ArrowRight className="text-primary" size={16} />
              </div>
            </div>
          </div>
          <div className="col-span-3 relative z-0">
            <Image
              src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
              alt="blood pressure"
              fill
            />
          </div>
        </div>
        <div className="mt-23.25 flex flex-col gap-9 mx-19.75">
          <p className="font-medium text-[40px] leading-[22.4px]">News</p>
          <div className="flex flex-col gap-8.5">
            <div className="flex gap-4">
              <div className="relative w-161.75">
                <Image src="/images/black_woman.jpg" alt="News image" fill />
                <div className="absolute bottom-7 left-6.25 bg-white pt-5 pl-4.25 max-w-77">
                  <div className="flex items-center gap-2.75">
                    <p className="py-[1.5px] px-[7.5px] bg-[#F4F2FF] text-[#6B7280]">
                      News
                    </p>
                    <p className="font-medium text-sm text-[#6B7280]">
                      9 December 2025
                    </p>
                  </div>
                  <p className="mt-1.5 text-2xl leading-6.5 tracking-[-0.41px]">
                    Nigeria invest in blood pushing the idea and saving more
                    life.{" "}
                  </p>
                  <div className="flex gap-2.25 items-center mt-10 mb-4.75">
                    <p className="text-primary font-medium">Read news</p>
                    <ArrowRight className="text-primary" size={16} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-9.75">
                {[
                  "Nigerian- Medical system just release the cure for HIV",
                  "Scientists discover new mechanism regulating",
                  "Scientists discover prevention for Malaria and Fever",
                ].map((title, id) => (
                  <div
                    key={id}
                    className="flex gap-4 shadow-[0_4px_20px_#00000026]"
                  >
                    <div className="w-56.5 h-33.75 bg-gray-300 relative">
                      <Image
                        src="/images/news_image.jpg"
                        alt="news image"
                        fill
                      />
                    </div>
                    <div className="flex flex-col pt-3 pb-3.75 pr-9.25">
                      <div className="flex flex-col gap-2">
                        <p className="font-medium text-sm text-[#6B7280]">
                          9 December 2025
                        </p>
                        <p className="text-base font-medium">{title}</p>
                      </div>
                      <div className="flex gap-2.25 items-center ">
                        <p className="text-primary font-medium">Read news</p>
                        <ArrowRight className="text-primary" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="#"
              className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary"
            >
              Read more
            </Link>
          </div>
        </div>
        <div className="relative mt-63.75 bg-black flex flex-col gap-14.25 pt-13.75 px-20.25 pb-14.25">
          <p className="font-bold font-helvetica text-[32px] leading-5.5 text-white tracking-[-0.41px]">
            Blivap
          </p>
          <div className="flex justify-between">
            <div className="flex flex-col gap-5">
              <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
                Knowledge
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                Giving blood
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                About blood
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                About Sperm
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                our expertise
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
                Our audiences
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                Health care
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">Donors</p>
            </div>
            <div className="flex flex-col gap-5">
              <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
                About Blivap
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">News</p>
              <p className=" text-base text-white tracking-[-0.41px]">
                Education
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
                Service & Contract
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                Frequently asked question
              </p>
              <p className=" text-base text-white tracking-[-0.41px]">
                Contact us
              </p>
            </div>
          </div>
          <div className="absolute -top-28 right-20.25 bg-[#F4F2FF]  flex flex-col gap-6.25 shadow-[0px_0px_20px_#00000040] max-w-132 px-6 py-3.5">
            <div className="flex flex-col gap-3.5">
              <p className="font-medium text-xl leading-5.5">
                Save lives and earn money with your blood or spam
              </p>
              <p className="text-base tracking-[-0.41px] text-[#333333]">
                With your blood and spam we save and improve lives
              </p>
            </div>
            <Link
              href="#"
              className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary"
            >
              Register as a donor
            </Link>
          </div>
        </div>
        <div className="bg-[#171717] flex py-8 gap-11 pl-20.25">
          <p className="text-white">coordinated Vulnerability Disclosure</p>
          <p className="text-white">Privacy & Cookies</p>
          <p className="text-white">Terms and conditions</p>
        </div>
      </div>
    </HomeLayout>
  );
}
