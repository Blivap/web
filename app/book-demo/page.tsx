"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import { Send } from "lucide-react";
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
    setSubmitted(true);
  };

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 md:py-10 max-w-xl mx-auto">
        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight">
            Book a demo
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            See how Blivap can help your organization. We&apos;ll walk you
            through the platform.
          </p>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-5 text-center">
            <p className="font-medium text-sm text-black">Request received</p>
            <p className="text-xs text-[#6B7280] mt-1">
              We&apos;ll be in touch shortly to confirm your demo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-[#374151] mb-1"
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
                className="w-full text-sm border border-[#E5E7EB] rounded-md px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#374151] mb-1"
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
                className="w-full text-sm border border-[#E5E7EB] rounded-md px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="organization"
                className="block text-xs font-medium text-[#374151] mb-1"
              >
                Organization{" "}
                <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                className="w-full text-sm border border-[#E5E7EB] rounded-md px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="Hospital, clinic, or company"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-xs font-medium text-[#374151] mb-1"
              >
                Message{" "}
                <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <textarea
                id="message"
                rows={3}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full text-sm border border-[#E5E7EB] rounded-md px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-colors"
                placeholder="Preferred time or questions"
              />
            </div>
            <button
              type="submit"
              className="mt-1 w-full sm:w-auto text-white text-xs font-medium py-2.5 px-4 bg-primary hover:bg-primary/90 rounded-md inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={14} />
              Request demo
            </button>
          </form>
        )}
      </div>
    </HomeLayout>
  );
}
