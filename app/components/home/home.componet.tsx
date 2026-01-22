import { HomeLayout } from "../layout/home.layout.component";
import { FiBell } from "react-icons/fi";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
export const HomeComponent = () => {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col ">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mt-2 flex items-center justify-between">
          <p className="font-bold font-helvetica text-primary text-xl sm:text-2xl md:text-[32px]">
            Blivap
          </p>
          <div className="relative border-[0.5px] border-[#9CA3AF] rounded-full sm:p-4 p-1 flex items-center justify-center">
            <div className="absolute size-[7.5px] bg-[#FF0000] rounded-full right-2 top-1 sm:top-4 sm:right-4.5" />
            <FiBell size={24} className="stroke-1 text-2xl" />
          </div>
        </div>
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-2 sm:pb-0">
            {["About blood", "About donating", "What we do"].map((text, id) => (
              <p
                key={id}
                className="cursor-pointer transition-colors text-sm sm:text-base whitespace-nowrap hover:text-primary"
              >
                {text}
              </p>
            ))}
          </div>
          <div className="relative border border-[#D9D9D9] sm:p-2.5 p-1 flex items-center w-full sm:w-auto sm:max-w-89.75">
            <input
              className="outline-none w-full text-sm sm:text-base md:text-lg font-inter placeholder:text-[#6B7280] leading-5.5"
              type="text"
              placeholder="What are you looking for"
            />
          </div>
        </div>
        <div className="mt-4.5 grid grid-cols-1 md:grid-cols-5 ">
          <div className="col-span-1 md:col-span-2 flex flex-col px-4 sm:px-6 md:pl-19.5 pt-8 sm:pt-12 md:pt-15.5 gap-6 sm:gap-8 md:gap-45 min-h-100 sm:min-h-125 md:h-146.75 bg-primary">
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] text-white leading-tight sm:leading-10 md:leading-14">
                Save lives with your blood or spam
              </p>
              <div>
                <Link
                  className="w-fit bg-black hover:bg-black/80 active:bg-black transition duration-150  text-white py-2.5 sm:py-3.5 px-4 sm:px-6.25 inline-block text-sm sm:text-base"
                  href="/register"
                >
                  Register as a donor (EN)
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 bg-white px-4 sm:px-6 md:px-9 pt-6 sm:pt-8 md:pt-12 pb-8 sm:pb-12 md:pb-27 shadow-[0_4px_30px_#0000001A] max-w-140.5 relative w-full md:translate-x-18 z-10 mt-4 sm:mt-0">
              <p className="font-medium text-xl sm:text-2xl text-black">
                Quick links
              </p>
              <div className="flex flex-col gap-3 sm:gap-4">
                {["About donating", "Research", "About Blivap"].map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 sm:pb-4"
                  >
                    <p className="text-sm sm:text-base md:text-lg">{e}</p>
                    <ArrowRight strokeWidth={1.3} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative col-span-1 md:col-span-3 bg-green-300 min-h-75 sm:min-h-100 md:min-h-146.75">
            <Image
              src="/images/hero_image.jpg"
              alt="home illustration"
              fill
              className="object-cover"
            />
            <div className="absolute w-[90%] h-4 sm:h-6 bg-[#0005F2] -bottom-4 sm:-bottom-6" />
          </div>
        </div>
        <div className="mt-8 sm:mt-12 md:mt-37.75 grid grid-cols-1 md:grid-cols-5">
          <div className="col-span-1 md:col-span-3 flex flex-col px-4 sm:px-6 md:pl-19.5 pt-8 sm:pt-12 md:pt-15.5 gap-6 sm:gap-8 md:gap-7.25 pb-8 sm:pb-12 md:pb-26.75 pr-4 sm:pr-6 md:pr-22.5 bg-[#F4F2FF]">
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-black leading-tight sm:leading-8 md:leading-10">
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="#"
                className="w-full sm:w-fit text-white text-sm sm:text-base py-2.5 sm:py-3.5 px-4 sm:px-[17.7px] bg-primary hover:bg-primary/90 transition-colors inline-block text-center"
              >
                Become a donor
              </Link>
              <Link
                href="#"
                className="w-full sm:w-fit border-2 border-black py-2.5 sm:py-3.5 px-4 sm:px-[17.7px] text-[#333333] hover:bg-black hover:text-white text-sm sm:text-base transition-colors inline-block text-center"
              >
                Read more
              </Link>
            </div>
          </div>
          <div className="relative col-span-1 md:col-span-2 bg-white md:-translate-x-10 md:translate-y-8.25 flex flex-col gap-8 sm:gap-12 md:gap-16.5 px-4 sm:px-6 md:px-0">
            <div className="flex flex-col gap-8 sm:gap-12 md:gap-20.5 mt-8 sm:mt-12 md:mt-15 max-w-120.5 px-4 sm:px-6 md:px-14.5">
              {[
                {
                  title: "Your donation",
                  desc: "Tell the story of hope, recovery and future",
                },
                {
                  title: "About Blivap",
                  desc: "In a world full of charge, we continue to deliver safe blood products",
                },
                {
                  title: "Lifesaving research",
                  desc: "Life saving blood products, therapeutics, services, diagnostics and knowledge for health care",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-lg sm:text-xl md:text-2xl font-medium">
                    {item.title}
                  </p>
                  <p className="font-medium text-sm sm:text-base">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2.25 items-center ml-4 sm:ml-6 md:ml-6.25 mb-6 sm:mb-8 md:mb-5.25">
              <p className="text-primary font-medium text-sm sm:text-base">
                What we do
              </p>{" "}
              <ArrowRight className="text-primary" size={16} />
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 md:mt-37.75 grid grid-cols-1 md:grid-cols-5">
          <div className="z-10 col-span-1 md:col-span-2 bg-[#F9E8EE] w-full md:w-177 md:translate-y-8.25 flex flex-col gap-6 sm:gap-10 md:gap-16.5 px-4 sm:px-6 md:px-19.75 pt-8 sm:pt-12 md:pt-30 pb-8 sm:pb-12 md:pb-29.5">
            <p className="font-medium text-xl sm:text-2xl md:text-[32px]">
              Save a Life
            </p>
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
              <p className="text-sm sm:text-base text-[#333333] font-medium">
                Nigeria has a lack of blood crises, this issue is the cause of
                many deaths and we as an organization decided to fix that
                problem by creating Blivap. Blivap helps connect two individuals
                who blood groups match and are one is willing to sell he or her
                blood to save another. We as Blivap also help connects people in
                need of sperm donors.
              </p>
              <div className="flex gap-2.25 items-center">
                <p className="text-primary font-medium text-sm sm:text-base">
                  About donating
                </p>
                <ArrowRight className="text-primary" size={16} />
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3 relative z-0 min-h-75 sm:min-h-100 md:min-h-125">
            <Image
              src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
              alt="blood pressure"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
        </div>
        <div className="mt-8 sm:mt-12 md:mt-23.25 flex flex-col gap-6 sm:gap-8 md:gap-9 mx-4 sm:mx-6 md:mx-12 lg:mx-19.75">
          <p className="font-medium text-2xl sm:text-3xl md:text-[40px] leading-tight sm:leading-[22.4px]">
            News
          </p>
          <div className="flex flex-col gap-6 sm:gap-8 md:gap-8.5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative w-full lg:w-161.75 min-h-75 sm:min-h-100">
                <Image
                  src="/images/black_woman.jpg"
                  alt="News image"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 sm:bottom-7 w-[90%] left-4 sm:left-6.25 bg-white pt-4 sm:pt-5 pl-3 sm:pl-4.25 max-w-full sm:max-w-77 pr-4">
                  <div className="flex items-center gap-2 sm:gap-2.75 flex-wrap">
                    <p className="py-[1.5px] px-[7.5px] bg-[#F4F2FF] text-[#6B7280] text-xs sm:text-sm">
                      News
                    </p>
                    <p className="font-medium text-xs sm:text-sm text-[#6B7280]">
                      9 December 2025
                    </p>
                  </div>
                  <p className="mt-2 sm:mt-1.5 text-base sm:text-lg md:text-2xl leading-tight sm:leading-6 md:leading-6.5 tracking-[-0.41px]">
                    Nigeria invest in blood pushing the idea and saving more
                    life.{" "}
                  </p>
                  <div className="flex gap-2.25 items-center mt-6 sm:mt-10 mb-3 sm:mb-4.75">
                    <p className="text-primary font-medium text-sm sm:text-base">
                      Read news
                    </p>
                    <ArrowRight className="text-primary" size={16} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6 sm:gap-8 md:gap-9.75">
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
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-[0_4px_20px_#00000026]"
                  >
                    <div className="relative w-full sm:w-56.5 h-40 sm:h-33.75">
                      <Image
                        className="object-cover"
                        src={title.url}
                        alt="news image"
                        fill
                        sizes="(max-width: 640px) 100vw, 226px"
                      />
                    </div>

                    <div className="flex flex-col p-3 sm:pb-3.75 sm:pr-6 lg:pr-9.25 flex-1">
                      <div className="flex flex-col gap-2">
                        <p className="font-medium text-xs sm:text-sm text-[#6B7280]">
                          9 December 2025
                        </p>
                        <p className="text-sm sm:text-base font-medium">
                          {title.description}
                        </p>
                      </div>
                      <div className="flex gap-2.25 items-center mt-2 sm:mt-0">
                        <p className="text-primary font-medium text-sm sm:text-base">
                          Read news
                        </p>
                        <ArrowRight className="text-primary" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Link
                href="#"
                className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary hover:bg-primary/90 transition-colors inline-block"
              >
                Read more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};
