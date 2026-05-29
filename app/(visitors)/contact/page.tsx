"use client";

import { Button } from "@/components/ui/button";
import { HomeLayout } from "@/layout/home.layout.component";
import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      primary: "support@blivap.com",
      secondary: "info@blivap.com",
      href: "mailto:support@blivap.com",
      accent: "bg-[#FFF1F3]",
    },
    {
      icon: Phone,
      label: "Phone",
      primary: "+234 XXX XXX XXXX",
      secondary: "Mon–Fri, 9AM–5PM WAT",
      href: "tel:+234XXXXXXXXXX",
      accent: "bg-[#EEF2FF]",
    },
    {
      icon: MapPin,
      label: "Office",
      primary: "Blivap Headquarters",
      secondary: "Lagos, Nigeria",
      href: null,
      accent: "bg-[#ECFDF3]",
    },
  ];

  const supportTopics = [
    "Blood or sperm donation guidance",
    "Hospital and partnership enquiries",
    "Platform or account support",
    "Research and collaboration requests",
  ];

  return (
    <HomeLayout>
      <div className="flex flex-1 flex-col gap-8 py-6 sm:gap-10 sm:py-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="overflow-hidden rounded-[28px] border border-[#E9D8DC] bg-linear-to-br from-[#FFF7F8] via-white to-[#FFF3F5] p-6 shadow-[0_14px_38px_rgba(15,23,42,0.06)] dark:border-primary/20 dark:from-[#2A1117] dark:via-[#111827] dark:to-[#1F172A] dark:shadow-[0_24px_60px_rgba(0,0,0,0.32)] sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary shadow-sm dark:bg-white/10">
              <MessageCircle size={14} />
              Contact Blivap
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl">
              Let&apos;s help you quickly.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B7280] dark:text-slate-400 sm:text-[15px]">
              Reach out for donor support, partnership conversations, platform
              questions, or research collaboration. We usually reply within 24
              hours on business days.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/8">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                  Response time
                </p>
                <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                  Within 24 hrs
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/8">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                  Support window
                </p>
                <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                  Mon-Fri, 9AM-5PM
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/8">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                  Focus
                </p>
                <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                  Donors and partners
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_20px_48px_rgba(0,0,0,0.28)] sm:p-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-black dark:text-white">
                  What we can help with
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
                  Pick the fastest route for your request.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {supportTopics.map((topic) => (
                <div
                  key={topic}
                  className="rounded-2xl border border-[#EEF2F6] bg-[#FCFCFD] px-4 py-3 text-sm font-medium text-[#374151] dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-300"
                >
                  {topic}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-[#FFF7F8] px-4 py-3 dark:bg-primary/10">
              <div className="flex items-center gap-2 text-primary">
                <Clock3 size={16} />
                <p className="text-sm font-semibold">Need a quick response?</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
                Email is the fastest option for detailed requests. Phone support
                is best for urgent coordination during working hours.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-slate-500">
                Contact channels
              </p>
              <h2 className="mt-2 text-xl font-semibold text-black dark:text-white">
                Talk to the right team
              </h2>
            </div>

            {contactMethods.map((method) => {
              const cardClass = `group flex items-start gap-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5 transition-all duration-200 dark:border-white/10 dark:bg-[#111827] ${
                method.href
                  ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_20px_44px_rgba(0,0,0,0.28)]"
                  : ""
              }`;
              const content = (
                <>
                  <div
                    className={`shrink-0 flex size-12 items-center justify-center rounded-2xl ${method.accent}`}
                  >
                    <method.icon className="text-primary" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                      {method.label}
                    </p>
                    <p className="mt-1 text-base font-semibold text-black dark:text-white">
                      {method.primary}
                    </p>
                    {method.secondary ? (
                      <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
                        {method.secondary}
                      </p>
                    ) : null}
                  </div>
                </>
              );

              return method.href ? (
                <a key={method.label} href={method.href} className={cardClass}>
                  {content}
                </a>
              ) : (
                <div key={method.label} className={cardClass}>
                  {content}
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
              <div className="border-b border-[#F1F5F9] bg-linear-to-r from-[#FFF7F8] via-white to-[#F8FAFC] px-5 py-5 dark:border-white/10 dark:from-[#2A1117] dark:via-[#111827] dark:to-[#0F172A] sm:px-6">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Send size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                      Send a message
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7280] dark:text-slate-400">
                      Share a few details and our team will follow up with the
                      right next step.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="px-5 py-6 sm:px-6 sm:py-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block text-sm font-medium text-black dark:text-white"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-[#FCFCFD] px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#9CA3AF] focus:border-primary focus:ring-4 focus:ring-primary/8 dark:border-white/10 dark:bg-[#0F172A] dark:text-white dark:placeholder:text-slate-500"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block text-sm font-medium text-black dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-[#FCFCFD] px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#9CA3AF] focus:border-primary focus:ring-4 focus:ring-primary/8 dark:border-white/10 dark:bg-[#0F172A] dark:text-white dark:placeholder:text-slate-500"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-sm font-medium text-black dark:text-white"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full resize-none rounded-2xl border border-[#E2E8F0] bg-[#FCFCFD] px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#9CA3AF] focus:border-primary focus:ring-4 focus:ring-primary/8 dark:border-white/10 dark:bg-[#0F172A] dark:text-white dark:placeholder:text-slate-500"
                    placeholder="Tell us how we can help."
                    required
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
                    By sending a message, you agree that our team may contact
                    you using the details you provided.
                  </p>
                  <Button
                    type="submit"
                    className="min-w-[150px] rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <Send size={16} />
                    Send message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
}
