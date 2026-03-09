"use client";

import { HomeLayout } from "../components/layout/home.layout.component";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
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
    },
    {
      icon: Phone,
      label: "Phone",
      primary: "+234 XXX XXX XXXX",
      secondary: "Mon–Fri, 9AM–5PM WAT",
      href: "tel:+234XXXXXXXXXX",
    },
    {
      icon: MapPin,
      label: "Office",
      primary: "Blivap Headquarters",
      secondary: "Lagos, Nigeria",
      href: null,
    },
  ];

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col">
        {/* Hero section */}
        <section className="bg-bg-secondary border-b border-border">
          <div className="px-4 sm:px-6 md:px-8 lg:px-20 xl:px-36 max-w-[1440px] mx-auto py-10 sm:py-14">
            <h1 className="font-semibold text-text-primary text-xl sm:text-2xl tracking-tight mb-2">
              Get in touch
            </h1>
            <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
              Have questions about donating, partnerships, or our platform?
              We’re here to help and usually respond within 24 hours.
            </p>
          </div>
        </section>

        <div className="px-4 sm:px-6 md:px-8 lg:px-20 xl:px-36 max-w-[1440px] mx-auto py-8 sm:py-12">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact methods */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                Contact options
              </h2>
              {contactMethods.map((method) => {
                const cardClass = `flex items-start gap-4 p-4 rounded-xl border border-border bg-white transition-all duration-200 ${
                  method.href
                    ? "hover:border-primary hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                    : ""
                }`;
                const content = (
                  <>
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <method.icon className="text-primary" size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text-tertiary mb-0.5">
                        {method.label}
                      </p>
                      <p className="text-sm font-medium text-text-primary">
                        {method.primary}
                      </p>
                      {method.secondary && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {method.secondary}
                        </p>
                      )}
                    </div>
                  </>
                );
                return method.href ? (
                  <a
                    key={method.label}
                    href={method.href}
                    className={cardClass}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={method.label} className={cardClass}>
                    {content}
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="text-primary" size={18} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-text-primary text-base">
                      Send a message
                    </h2>
                    <p className="text-xs text-text-secondary">
                      We’ll get back to you as soon as we can.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-border rounded-xl p-6 sm:p-8 shadow-sm"
                >
                  <div className="grid sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-text-primary mb-1.5"
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
                        className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-text-primary mb-1.5"
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
                        className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-text-primary mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors resize-none"
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-w-[140px] text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send size={16} />
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
