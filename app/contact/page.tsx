"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
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
          <h1 className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Contact Us
          </h1>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-black mb-3 sm:mb-4">
                  Get in Touch
                </h2>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Have questions about donating, need support, or want to learn 
                  more about Blivap? We're here to help. Reach out to us through 
                  any of the channels below.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#F9E8EE] p-2 sm:p-3 rounded-full">
                    <Mail className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Email</h3>
                    <p className="text-sm sm:text-base text-[#333333]">support@blivap.com</p>
                    <p className="text-sm sm:text-base text-[#333333]">info@blivap.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#E4E5FF] p-2 sm:p-3 rounded-full">
                    <Phone className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Phone</h3>
                    <p className="text-sm sm:text-base text-[#333333]">+234 XXX XXX XXXX</p>
                    <p className="text-xs sm:text-sm text-[#6B7280]">Mon-Fri, 9AM-5PM WAT</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-[#F4F2FF] p-2 sm:p-3 rounded-full">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Address</h3>
                    <p className="text-sm sm:text-base text-[#333333]">
                      Blivap Headquarters<br />
                      Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
              <h2 className="font-medium text-xl sm:text-2xl text-black mb-4 sm:mb-6">
                Send us a Message
              </h2>
              <form className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 bg-primary hover:bg-primary/90 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

