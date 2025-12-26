"use client";

import { FiBell } from "react-icons/fi";
import { HomeLayout } from "./components/layout/home.layout.component";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function Home() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col ">
        <motion.div
          className="px-4 sm:px-6 md:px-12 lg:px-20 mt-2 flex items-center justify-between"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <p className="font-bold font-helvetica text-primary text-xl sm:text-2xl md:text-[32px]">
            Blivap
          </p>
          <motion.div
            className="relative border-[0.5px] border-[#9CA3AF] rounded-full sm:p-4 p-1 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute size-[7.5px] bg-[#FF0000] rounded-full right-2 top-1 sm:top-4 sm:right-4.5" />
            <FiBell size={24} className="stroke-1 text-2xl" />
          </motion.div>
        </motion.div>
        <motion.div
          className="px-4 sm:px-6 md:px-12 lg:px-20 mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-2 sm:pb-0">
            {["About blood", "About donating", "What we do"].map((text, id) => (
              <motion.p
                key={id}
                whileHover={{ scale: 1.05, color: "#960018" }}
                className="cursor-pointer transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {text}
              </motion.p>
            ))}
          </div>
          <motion.div
            className="relative border border-[#D9D9D9] sm:p-2.5 p-1 flex items-center w-full sm:w-auto sm:max-w-89.75"
            whileFocus={{ scale: 1.02 }}
          >
            <input
              className="outline-none w-full text-sm sm:text-base md:text-lg font-inter placeholder:text-[#6B7280] leading-5.5"
              type="text"
              placeholder="What are you looking for"
            />
          </motion.div>
        </motion.div>
        <div className="mt-4.5 grid grid-cols-1 md:grid-cols-5 ">
          <motion.div
            className="col-span-1 md:col-span-2 flex flex-col px-4 sm:px-6 md:pl-19.5 pt-8 sm:pt-12 md:pt-[62px] gap-6 sm:gap-8 md:gap-[45px] min-h-[400px] sm:min-h-[500px] md:h-146.75 bg-primary"
            initial="initial"
            animate="animate"
            variants={fadeInLeft}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="flex flex-col gap-4 sm:gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] text-white leading-tight sm:leading-10 md:leading-14"
                variants={fadeInUp}
              >
                Save lives with your blood or spam
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link
                  className="w-fit bg-black text-white py-2.5 sm:py-3.5 px-4 sm:px-[25px] inline-block text-sm sm:text-base"
                  href="#"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block"
                  >
                    Register as a donor (EN){" "}
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex flex-col gap-4 sm:gap-6 bg-white px-4 sm:px-6 md:px-9 pt-6 sm:pt-8 md:pt-12 pb-8 sm:pb-12 md:pb-[108px] shadow-[0_4px_30px_#0000001A] max-w-[562px] relative w-full md:translate-x-18 z-10 mt-4 sm:mt-0"
              initial="initial"
              animate="animate"
              variants={scaleIn}
              transition={{ delay: 0.4 }}
            >
              <p className="font-medium text-xl sm:text-2xl text-black">
                Quick links
              </p>
              <motion.div
                className="flex flex-col gap-3 sm:gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {["About donating", "Research", "About Blivap"].map((e, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 sm:pb-4"
                    variants={fadeInUp}
                    whileHover={{ x: 5 }}
                  >
                    <p className="text-sm sm:text-base md:text-lg">{e}</p>
                    <ArrowRight strokeWidth={1.3} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative col-span-1 md:col-span-3 bg-green-300 min-h-[300px] sm:min-h-[400px] md:min-h-146.75"
            initial="initial"
            animate="animate"
            variants={fadeInRight}
            transition={{ delay: 0.3 }}
          >
            <Image
              src="/images/hero_image.jpg"
              alt="home illustration"
              fill
              className="object-cover"
            />
            <motion.div
              className="absolute w-[90%] h-4 sm:h-6 bg-[#0005F2] -bottom-4 sm:-bottom-6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>
        </div>
        <motion.div
          className="mt-8 sm:mt-12 md:mt-37.75 grid grid-cols-1 md:grid-cols-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div
            className="col-span-1 md:col-span-3 flex flex-col px-4 sm:px-6 md:pl-19.5 pt-8 sm:pt-12 md:pt-[62px] gap-6 sm:gap-8 md:gap-[29px] pb-8 sm:pb-12 md:pb-[107px] pr-4 sm:pr-6 md:pr-[90px] bg-[#F4F2FF]"
            variants={fadeInLeft}
          >
            <motion.div
              className="flex flex-col gap-4 sm:gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p
                className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-black leading-tight sm:leading-8 md:leading-10"
                variants={fadeInUp}
              >
                Together we help bring people who need Blood/Spam to people who
                are willing to donate blood/Spam
              </motion.p>
              <motion.p
                className="w-full sm:w-fit text-[#333333] text-sm sm:text-base"
                variants={fadeInUp}
              >
                Blivap stands for life. For people. For making a difference at
                these moments when it really matters. Thanks to our dedicated
                donors, patients get a chance at a better future and you also
                get a better life by donating.
              </motion.p>
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              variants={fadeInUp}
            >
              <Link
                href="#"
                className="w-full sm:w-fit text-white text-sm sm:text-base py-2.5 sm:py-3.5 px-4 sm:px-[17.7px] bg-primary inline-block text-center"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block"
                >
                  Become a donor
                </motion.span>
              </Link>
              <Link
                href="#"
                className="w-full sm:w-fit border-2 border-black py-2.5 sm:py-3.5 px-4 sm:px-[17.7px] text-[#333333] text-sm sm:text-base inline-block text-center"
              >
                <motion.span
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#000",
                    color: "#fff",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="block px-[17.7px] py-3.5 -mx-[17.7px] -my-3.5 transition-colors"
                >
                  Read more
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative col-span-1 md:col-span-2 bg-white md:-translate-x-10 md:translate-y-[33px] flex flex-col gap-8 sm:gap-12 md:gap-[66px] px-4 sm:px-6 md:px-0"
            variants={fadeInRight}
          >
            <motion.div
              className="flex flex-col gap-8 sm:gap-12 md:gap-[82px] mt-8 sm:mt-12 md:mt-[60px] max-w-[482px] px-4 sm:px-6 md:px-[58px]"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
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
                <motion.div
                  key={i}
                  className="flex flex-col gap-3 sm:gap-4"
                  variants={fadeInUp}
                  whileHover={{ x: 5 }}
                >
                  <p className="text-lg sm:text-xl md:text-2xl font-medium">
                    {item.title}
                  </p>
                  <p className="font-medium text-sm sm:text-base">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="flex gap-[9px] items-center ml-4 sm:ml-6 md:ml-[25px] mb-6 sm:mb-8 md:mb-[21px]"
              whileHover={{ x: 5 }}
            >
              <p className="text-primary font-medium text-sm sm:text-base">
                What we do
              </p>{" "}
              <ArrowRight className="text-primary" size={16} />
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-8 sm:mt-12 md:mt-37.75 grid grid-cols-1 md:grid-cols-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div
            className="z-10 col-span-1 md:col-span-2 bg-[#F9E8EE] w-full md:w-177 md:translate-y-8.25 flex flex-col gap-6 sm:gap-10 md:gap-16.5 px-4 sm:px-6 md:px-19.75 pt-8 sm:pt-12 md:pt-30 pb-8 sm:pb-12 md:pb-29.5"
            variants={fadeInLeft}
          >
            <motion.p
              className="font-medium text-xl sm:text-2xl md:text-[32px]"
              variants={fadeInUp}
            >
              Save a Life
            </motion.p>
            <motion.div
              className="flex flex-col gap-4 sm:gap-6 md:gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p
                className="text-sm sm:text-base text-[#333333] font-medium"
                variants={fadeInUp}
              >
                Nigeria has a lack of blood crises, this issue is the cause of
                many deaths and we as an organization decided to fix that
                problem by creating Blivap. Blivap helps connect two individuals
                who blood groups match and are one is willing to sell he or her
                blood to save another. We as Blivap also help connects people in
                need of sperm donors.
              </motion.p>
              <motion.div
                className="flex gap-2.25 items-center"
                variants={fadeInUp}
                whileHover={{ x: 5 }}
              >
                <p className="text-primary font-medium text-sm sm:text-base">
                  About donating
                </p>
                <ArrowRight className="text-primary" size={16} />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="col-span-1 md:col-span-3 relative z-0 min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
            variants={fadeInRight}
          >
            <Image
              src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
              alt="blood pressure"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-8 sm:mt-12 md:mt-23.25 flex flex-col gap-6 sm:gap-8 md:gap-9 mx-4 sm:mx-6 md:mx-12 lg:mx-19.75"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <motion.p
            className="font-medium text-2xl sm:text-3xl md:text-[40px] leading-tight sm:leading-[22.4px]"
            variants={fadeInUp}
          >
            News
          </motion.p>
          <div className="flex flex-col gap-6 sm:gap-8 md:gap-8.5">
            <div className="flex flex-col lg:flex-row gap-4">
              <motion.div
                className="relative w-full lg:w-161.75 min-h-[300px] sm:min-h-[400px]"
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/images/black_woman.jpg"
                  alt="News image"
                  fill
                  className="object-cover"
                />
                <motion.div
                  className="absolute bottom-4 sm:bottom-7 w-[90%] left-4 sm:left-6.25 bg-white pt-4 sm:pt-5 pl-3 sm:pl-4.25 max-w-full sm:max-w-77 pr-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
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
                  <motion.div
                    className="flex gap-2.25 items-center mt-6 sm:mt-10 mb-3 sm:mb-4.75"
                    whileHover={{ x: 5 }}
                  >
                    <p className="text-primary font-medium text-sm sm:text-base">
                      Read news
                    </p>
                    <ArrowRight className="text-primary" size={16} />
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div
                className="flex flex-col gap-6 sm:gap-8 md:gap-9.75"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
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
                  <motion.div
                    key={id}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-[0_4px_20px_#00000026]"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -5 }}
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
                      <motion.div
                        className="flex gap-2.25 items-center mt-2 sm:mt-0"
                        whileHover={{ x: 5 }}
                      >
                        <p className="text-primary font-medium text-sm sm:text-base">
                          Read news
                        </p>
                        <ArrowRight className="text-primary" size={16} />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="#"
                className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary inline-block"
              >
                Read more
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
}
