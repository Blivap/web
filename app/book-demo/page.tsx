"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import Link from "next/link";
import { ArrowLeft, Calendar, Send } from "lucide-react";
import { useState } from "react";

export default function BookDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to API when available
    setSubmitted(true);
  };

  return (
    <HomeLayout>
      <div className="flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 md:py-8 lg:py-10 ">
        <div>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={20} />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 mx-auto items-center">
          <h1 className="font-bold font-helvetica text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Book a demo
          </h1>

          <p className="text-sm sm:text-base text-[#333333] leading-relaxed max-w-2xl ">
            See how Blivap can help your organization connect donors with those
            in need. Schedule a short demo and we&apos;ll walk you through the
            platform.
          </p>

          {submitted ? (
            <div className="bg-[#F4F2FF] border border-[#E4E5FF] rounded-2xl p-6 sm:p-8 text-center">
              <p className="font-medium text-lg text-black mb-2">
                Request received
              </p>
              <p className="text-sm text-[#333333]">
                We&apos;ll be in touch shortly to confirm your demo slot.
              </p>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm  max-w-2xl w-full">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="bg-[#F4F2FF] p-2 rounded-full">
                  <Calendar className="text-primary" size={20} />
                </div>
                <h2 className="font-medium text-xl sm:text-2xl text-black">
                  Schedule your demo
                </h2>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:gap-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#333333] mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#333333] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-[#333333] mb-2"
                  >
                    Organization (optional)
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: e.target.value,
                      })
                    }
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder="Hospital, clinic, or company name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[#333333] mb-2"
                  >
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] rounded-lg px-4 py-3 outline-none focus:border-primary resize-none transition-colors"
                    placeholder="Preferred time, questions, or anything we should know..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-fit text-white text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6 bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 rounded-lg"
                >
                  <Send size={18} />
                  Request demo
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
