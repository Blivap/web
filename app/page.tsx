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
          className="px-20 mt-2 flex items-center justify-between"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <p className="font-bold font-helvetica text-primary text-[32px]">
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
          className="px-20 mt-2 flex items-center justify-between"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-8">
            {["About blood", "About donating", "What we do"].map((text, id) => (
              <motion.p
                key={id}
                whileHover={{ scale: 1.05, color: "#960018" }}
                className="cursor-pointer transition-colors"
              >
                {text}
              </motion.p>
            ))}
          </div>
          <motion.div
            className="relative border border-[#D9D9D9]  sm:p-2.5 p-1 flex items-center  w-full max-w-[359px]"
            whileFocus={{ scale: 1.02 }}
          >
            <input
              className="outline-none w-full text-sm sm:text-base md:text-lg font-inter placeholder:text-[#6B7280] leading-5.5"
              type="text"
              placeholder="What are you looking for"
            />
          </motion.div>
        </motion.div>
        <div className="mt-4.5 grid md:grid-cols-5">
          <motion.div
            className="col-span-2 flex flex-col pl-19.5 pt-[62px] gap-[45px] h-146.75 bg-primary"
            initial="initial"
            animate="animate"
            variants={fadeInLeft}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="flex flex-col gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p
                className="text-[48px] text-white leading-14"
                variants={fadeInUp}
              >
                Save lives with your blood or spam
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link
                  className="w-fit bg-black text-white py-3.5 px-[25px] inline-block"
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
              className="flex flex-col gap-6 bg-white px-9 pt-12 pb-[108px] shadow-[0_4px_30px_#0000001A] max-w-[562px] relative w-full md:translate-x-18 z-10"
              initial="initial"
              animate="animate"
              variants={scaleIn}
              transition={{ delay: 0.4 }}
            >
              <p className="font-medium text-2xl text-black">Quick links</p>
              <motion.div
                className="flex flex-col gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {["About donating", "Research", "About Blivap"].map((e, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between border-b border-[#E5E7EB] pb-4"
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
            className="relative col-span-3 bg-green-300 min-h-146.75"
            initial="initial"
            animate="animate"
            variants={fadeInRight}
            transition={{ delay: 0.3 }}
          >
            <Image src="/images/hero_image.jpg" alt="home illustration" fill />
            <motion.div
              className="absolute w-[90%] h-6 bg-[#0005F2] -bottom-6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>
        </div>
        <motion.div
          className="mt-37.75 grid md:grid-cols-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div
            className="col-span-3 flex flex-col pl-19.5 pt-[62px] gap-[29px] pb-[107px] pr-[90px] bg-[#F4F2FF]"
            variants={fadeInLeft}
          >
            <motion.div
              className="flex flex-col gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p
                className="text-[32px] text-black leading-10"
                variants={fadeInUp}
              >
                Together we help bring people who need Blood/Spam to people who
                are willing to donate blood/Spam
              </motion.p>
              <motion.p
                className="w-fit text-[#333333] text-base"
                variants={fadeInUp}
              >
                Blivap stands for life. For people. For making a difference at
                these moments when it really matters. Thanks to our dedicated
                donors, patients get a chance at a better future and you also
                get a better life by donating.
              </motion.p>
            </motion.div>
            <motion.div className="flex gap-4" variants={fadeInUp}>
              <Link
                href="#"
                className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary inline-block"
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
                className="border-2 border-black py-3.5 px-[17.7px] w-fit text-[#333333] text-base inline-block"
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
            className="relative col-span-2 bg-white  -translate-x-10 translate-y-[33px] flex flex-col gap-[66px]"
            variants={fadeInRight}
          >
            <motion.div
              className="flex flex-col gap-[82px] mt-[60px] max-w-[482px] px-[58px]"
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
                  className="flex flex-col gap-4"
                  variants={fadeInUp}
                  whileHover={{ x: 5 }}
                >
                  <p className="text-2xl font-medium">{item.title}</p>
                  <p className="font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="flex gap-[9px] items-center ml-[25px] mb-[21px]"
              whileHover={{ x: 5 }}
            >
              <p className="text-primary font-medium">What we do</p>{" "}
              <ArrowRight className="text-primary" size={16} />
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-37.75 grid md:grid-cols-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div
            className="z-10 col-span-2 bg-[#F9E8EE] w-177 translate-y-8.25 flex flex-col gap-16.5 px-19.75 pt-30 pb-29.5"
            variants={fadeInLeft}
          >
            <motion.p className="font-medium text-[32px]" variants={fadeInUp}>
              Save a Life
            </motion.p>
            <motion.div
              className="flex flex-col gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p
                className="text-base text-[#333333] font-medium"
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
                <p className="text-primary font-medium">About donating</p>
                <ArrowRight className="text-primary" size={16} />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="col-span-3 relative z-0"
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
          className="mt-23.25 flex flex-col gap-9 mx-19.75"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <motion.p
            className="font-medium text-[40px] leading-[22.4px]"
            variants={fadeInUp}
          >
            News
          </motion.p>
          <div className="flex flex-col gap-8.5">
            <div className="flex gap-4">
              <motion.div
                className="relative w-161.75"
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
              >
                <Image src="/images/black_woman.jpg" alt="News image" fill />
                <motion.div
                  className="absolute bottom-7 left-6.25 bg-white pt-5 pl-4.25 max-w-77"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
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
                  <motion.div
                    className="flex gap-2.25 items-center mt-10 mb-4.75"
                    whileHover={{ x: 5 }}
                  >
                    <p className="text-primary font-medium">Read news</p>
                    <ArrowRight className="text-primary" size={16} />
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div
                className="flex flex-col gap-9.75"
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
                    className="flex gap-4 shadow-[0_4px_20px_#00000026]"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -5 }}
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
                      <motion.div
                        className="flex gap-2.25 items-center"
                        whileHover={{ x: 5 }}
                      >
                        <p className="text-primary font-medium">Read news</p>
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
        <div className="relative mt-63.75 bg-black flex flex-col gap-14.25 pt-13.75 px-20.25 pb-14.25">
          <p className="font-bold font-helvetica text-[32px] leading-5.5 text-white tracking-[-0.41px]">
            Blivap
          </p>
          <div className="flex justify-between">
            {[
              {
                title: "Knowledge",
                items: [
                  "Giving blood",
                  "About blood",
                  "About Sperm",
                  "our expertise",
                ],
              },
              { title: "Our audiences", items: ["Health care", "Donors"] },
              { title: "About Blivap", items: ["News", "Education"] },
              {
                title: "Service & Contract",
                items: ["Frequently asked question", "Contact us"],
              },
            ].map((section, i) => (
              <div key={i} className="flex flex-col gap-5">
                <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
                  {section.title}
                </p>
                {section.items.map((item, j) => (
                  <p
                    key={j}
                    className="text-base text-white tracking-[-0.41px] cursor-pointer hover:text-primary transition-colors"
                  >
                    {item}
                  </p>
                ))}
              </div>
            ))}
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
              className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary hover:bg-primary/90 transition-colors inline-block"
            >
              Register as a donor
            </Link>
          </div>
        </div>
        <div className="bg-[#171717] flex py-8 gap-11 pl-20.25">
          {[
            "coordinated Vulnerability Disclosure",
            "Privacy & Cookies",
            "Terms and conditions",
          ].map((text, i) => (
            <p
              key={i}
              className="text-white cursor-pointer hover:text-primary transition-colors"
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
}
