"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  Users,
  FileText,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Healthcare() {
  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
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
            For Healthcare Professionals
          </motion.h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <motion.div
              className="flex flex-col gap-3 sm:gap-4"
              variants={fadeInUp}
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Partner with Blivap
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Healthcare professionals play a crucial role in the donation
                process. Blivap provides tools and resources to help you connect
                with donors, manage appointments, and ensure safe, effective
                donations. Join our network of medical facilities and help save
                lives.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8"
              variants={staggerContainer}
            >
              {[
                {
                  icon: Stethoscope,
                  title: "Donor Management",
                  desc: "Access a network of verified donors and manage donation appointments efficiently through our platform. Streamline your workflow with our integrated management system.",
                  color: "bg-[#F9E8EE]",
                },
                {
                  icon: Users,
                  title: "Patient Matching",
                  desc: "Quickly find compatible donors for your patients using our advanced matching system. Get instant notifications when matches are found.",
                  color: "bg-[#E4E5FF]",
                },
                {
                  icon: FileText,
                  title: "Resources",
                  desc: "Access educational materials, research data, and best practices to support your work. Stay updated with the latest medical guidelines.",
                  color: "bg-[#F4F2FF]",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm"
                  variants={fadeInUp}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    className={`${feature.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}
                  >
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Platform Features
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    For Your Practice
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Easy appointment scheduling system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Real-time donor availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Patient record management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Automated notifications and reminders</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">
                    Support & Training
                  </h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Comprehensive training materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>24/7 technical support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Regular updates and best practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#F4F2FF] p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8"
              variants={fadeInUp}
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                Join Our Network
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Connect with other healthcare professionals, access our donor
                network, and help us improve healthcare outcomes for everyone.
                Register your facility today and become part of a life-saving
                network.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/healthcare&professionals"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Learn more
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
}
