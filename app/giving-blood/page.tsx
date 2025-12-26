"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
<<<<<<< HEAD
import { ArrowLeft, Droplet, CheckCircle, Clock, Shield, Heart } from "lucide-react";
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
import { ArrowLeft, Droplet, CheckCircle } from "lucide-react";
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653

export default function GivingBlood() {
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
            Giving Blood
          </motion.h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
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
            Giving Blood
          </h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                The Gift of Life
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Giving blood is one of the most selfless acts you can do. Your 
                donation can save up to three lives and make a significant 
<<<<<<< HEAD
                difference in someone's health journey. Every donation matters, 
                and every donor is a hero.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8"
              variants={staggerContainer}
            >
              {[
                {
                  icon: Droplet,
                  title: "Before Donation",
                  items: [
                    "Eat a healthy meal and stay hydrated",
                    "Get a good night's sleep (at least 7-8 hours)",
                    "Bring a valid ID (driver's license, passport, or national ID)",
                    "Wear comfortable clothing with sleeves that can be rolled up",
                    "Avoid heavy exercise 24 hours before donation",
                    "Drink plenty of water (at least 500ml before donation)"
                  ],
                  color: "bg-[#F9E8EE]"
                },
                {
                  icon: CheckCircle,
                  title: "After Donation",
                  items: [
                    "Rest for 10-15 minutes before leaving",
                    "Drink plenty of fluids (water, juice) for the next 24 hours",
                    "Avoid heavy lifting or strenuous activity for 24 hours",
                    "Keep the bandage on for at least 4 hours",
                    "Eat iron-rich foods to help replenish your blood",
                    "Avoid alcohol for 24 hours after donation"
                  ],
                  color: "bg-[#E4E5FF]"
                }
              ].map((section, i) => (
                <motion.div 
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm"
                  variants={fadeInUp}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className={`${section.color} p-2 sm:p-3 rounded-full`}>
                      <section.icon className="text-primary" size={20} />
                    </div>
                    <h3 className="font-semibold text-lg sm:text-xl">{section.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle className="text-primary mt-1 flex-shrink-0" size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Eligibility Requirements
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">General Requirements</h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Age: 18-65 years old</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Weight: At least 50kg</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Good general health</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>No recent illness or infection</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Frequency</h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <Clock className="text-primary mt-1" size={16} />
                      <span>Whole blood: Every 56 days (8 weeks)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="text-primary mt-1" size={16} />
                      <span>Platelets: Every 7 days (up to 24 times/year)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="text-primary mt-1" size={16} />
                      <span>Plasma: Every 28 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Ready to Give?
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Join thousands of donors who are making a difference. Register 
                today and start saving lives. The entire process takes less than 
                an hour, and you'll be making a life-saving contribution to your community.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth?tab=register"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Register as a donor
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
=======
                difference in someone's health journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-[#F9E8EE] p-2 sm:p-3 rounded-full">
                    <Droplet className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl">Before Donation</h3>
                </div>
                <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Eat a healthy meal and stay hydrated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Get a good night's sleep</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Bring a valid ID</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-[#E4E5FF] p-2 sm:p-3 rounded-full">
                    <CheckCircle className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl">After Donation</h3>
                </div>
                <ul className="flex flex-col gap-2 text-sm sm:text-base text-[#333333]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Rest for 10-15 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Drink plenty of fluids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <span>Avoid heavy lifting for 24 hours</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8">
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Ready to Give?
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-4 sm:mb-6">
                Join thousands of donors who are making a difference. Register 
                today and start saving lives.
              </p>
              <Link
                href="/auth?tab=register"
                className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
              >
                Register as a donor
              </Link>
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
