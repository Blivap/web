"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
<<<<<<< HEAD
import { ArrowLeft, CheckCircle, Clock, Shield, Heart, Users } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
=======
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653

export default function AboutDonating() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
<<<<<<< HEAD
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={20} />
            <span>Back to home</span>
          </Link>
        </motion.div>

        <motion.div 
          className="flex flex-col gap-4 sm:gap-6 md:gap-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1 
            className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            variants={fadeInUp}
          >
            About Donating
          </motion.h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <motion.div 
              className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="flex flex-col gap-3 sm:gap-4"
                variants={fadeInUp}
              >
=======
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </Link>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <h1 className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            About Donating
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="flex flex-col gap-3 sm:gap-4">
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  How to Become a Donor
                </h2>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Becoming a blood or sperm donor is a rewarding experience that 
                  helps save lives. The process is simple, safe, and takes only a 
<<<<<<< HEAD
                  short amount of your time. At Blivap, we make the donation process 
                  as easy and convenient as possible.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  You can register online, book appointments, and track your donation 
                  history all in one place. Our platform connects you with those in 
                  need while ensuring your safety and well-being throughout the process.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4"
                >
                  <Link
                    href="/auth?tab=register"
                    className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                  >
                    Register as a donor
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                className="relative h-48 sm:h-64 md:h-96 bg-[#F9E8EE] rounded-2xl overflow-hidden"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
=======
                  short amount of your time.
                </p>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  At Blivap, we make the donation process as easy and convenient 
                  as possible. You can register online, book appointments, and track 
                  your donation history all in one place.
                </p>
                <Link
                  href="/auth?tab=register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors mt-3 sm:mt-4"
                >
                  Register as a donor
                </Link>
              </div>

              <div className="relative h-48 sm:h-64 md:h-96 bg-[#F9E8EE] rounded-2xl">
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
                <Image
                  src="/images/africa-humanitarian-aid-doctor-taking-care-patient.png"
                  alt="Donation process"
                  fill
                  className="object-cover rounded-2xl"
                />
<<<<<<< HEAD
              </motion.div>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8"
              variants={staggerContainer}
            >
              {[
                {
                  icon: Shield,
                  title: "Step 1: Register",
                  desc: "Create your account on Blivap and complete your donor profile with your blood type and medical information. Our secure platform ensures your data is protected.",
                  color: "bg-[#F9E8EE]"
                },
                {
                  icon: Clock,
                  title: "Step 2: Book Appointment",
                  desc: "Schedule your donation appointment at a convenient time and location that works for you. Choose from multiple donation centers across Nigeria.",
                  color: "bg-[#E4E5FF]"
                },
                {
                  icon: Heart,
                  title: "Step 3: Donate",
                  desc: "Visit the donation center, complete the donation process with our trained medical professionals, and help save lives while earning compensation.",
                  color: "bg-[#F4F2FF]"
                }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm"
                  variants={fadeInUp}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                >
                  <div className={`${step.color} p-3 rounded-full w-fit mb-3 sm:mb-4`}>
                    <step.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-[#333333]">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8"
              variants={fadeInUp}
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Benefits of Donating
              </h2>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <motion.div
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="text-primary" size={24} />
                    <h3 className="font-semibold text-lg sm:text-xl">For Recipients</h3>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Life-saving blood or sperm for critical medical needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Helps patients recover from surgery, trauma, or medical conditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Access to compatible donors through our matching system</span>
                    </li>
                  </ul>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="text-primary" size={24} />
                    <h3 className="font-semibold text-lg sm:text-xl">For Donors</h3>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Earn money while making a meaningful difference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Track your donation history and build your donor profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Contribute to saving lives in your community</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={18} />
                      <span>Free health screening with each donation</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth?tab=register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Start Your Donor Journey
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
=======
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Step 1: Register</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Create your account on Blivap and complete your donor profile 
                  with your blood type and medical information.
                </p>
              </div>
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Step 2: Book Appointment</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Schedule your donation appointment at a convenient time and 
                  location that works for you.
                </p>
              </div>
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Step 3: Donate</h3>
                <p className="text-sm sm:text-base text-[#333333]">
                  Visit the donation center, complete the donation process, 
                  and help save lives while earning compensation.
                </p>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Benefits of Donating
              </h2>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2">For Recipients</h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    Your donation provides life-saving blood or sperm to those in 
                    critical need, helping patients recover from surgery, trauma, 
                    or medical conditions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2">For Donors</h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    Earn money while making a difference. Track your donation 
                    history, build your donor profile, and contribute to saving 
                    lives in your community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
      </div>
    </HomeLayout>
  );
}
<<<<<<< HEAD
=======

>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
