"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Award, Shield, Users, Target, CheckCircle } from "lucide-react";
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

export default function OurExpertise() {
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
            Our Expertise
          </motion.h1>

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <motion.div 
              className="flex flex-col gap-3 sm:gap-4"
              variants={fadeInUp}
            >
              <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                Leading the Way in Donation Services
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-3xl">
                Blivap brings together years of expertise in healthcare, technology, 
                and community building to create a platform that makes donation 
                services accessible, safe, and effective. Our team combines medical 
                knowledge, technological innovation, and compassionate service delivery.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8"
              variants={staggerContainer}
            >
              {[
                {
                  icon: Shield,
                  title: "Safety First",
                  desc: "We maintain the highest standards of safety and quality in all our donation processes, ensuring the well-being of both donors and recipients. All our partner facilities are certified and regularly audited.",
                  color: "bg-[#F9E8EE]"
                },
                {
                  icon: Award,
                  title: "Quality Assurance",
                  desc: "Our rigorous screening and matching processes ensure that every donation meets the highest quality standards. We follow international best practices and local regulations.",
                  color: "bg-[#E4E5FF]"
                },
                {
                  icon: Users,
                  title: "Community Focus",
                  desc: "We understand the needs of our community and work tirelessly to improve access to life-saving donations. Our platform is built with the community in mind.",
                  color: "bg-[#F4F2FF]"
                }
              ].map((expertise, i) => (
                <motion.div 
                  key={i}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm"
                  variants={fadeInUp}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                >
                  <div className={`${expertise.color} p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4`}>
                    <expertise.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">{expertise.title}</h3>
                  <p className="text-sm sm:text-base text-[#333333]">{expertise.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl mt-6 sm:mt-8 border-2 border-[#F4F2FF]"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-primary" size={28} />
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black">
                  Our Core Competencies
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">Medical Expertise</h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Partnership with certified medical facilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Qualified healthcare professionals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Comprehensive screening processes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Quality control and assurance</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Technology Innovation</h4>
                  <ul className="flex flex-col gap-2 text-sm text-[#333333]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Advanced matching algorithms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Secure platform and data protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Real-time tracking and notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-primary mt-1" size={16} />
                      <span>Mobile-first design for accessibility</span>
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
                Trusted by Thousands
              </h2>
              <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-6">
                Our expertise has helped thousands of donors and recipients 
                connect safely and effectively. We're committed to continuing 
                to improve and expand our services, always putting safety and 
                quality first.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/about"
                  className="w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors inline-block"
                >
                  Learn more about us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
}
