"use client";

import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import Image from "next/image";
import { useState } from "react";

export default function WaitList() {
  const [topEmail, setTopEmail] = useState("");
  const [footerEmail, setFooterEmail] = useState("");

  return (
    <div className="mx-auto max-w-319.25 px-2 pt-2.5 text-[#111827] dark:text-white">
      <div className="flex items-center justify-between">
        <p className="font-helvetica text-primary font-bold text-3xl md:text-5xl leading-5.5">
          Blivap
        </p>
        <div className="py-2 px-3.5 bg-primary rounded-[20px]">
          <p className="text-sm text-text-inverse">Get Early Access</p>
        </div>
      </div>
      <div className="mt-20 grid md:grid-cols-2 gap-40 sm:gap-2">
        <div>
          <div className=" ">
            <p className="text-4xl md:text-5xl dark:text-white">
              Are you Ready for a revolution in the <br />
              <span className="font-bold">Medical industry?</span>{" "}
              <span className="text-primary">Explore us</span>
            </p>
            <p className="mt-15 text-base leading-6.75 text-text-tertiary dark:text-slate-400">
              Blood and sperm donors – use our platform and donor ID cards to
              manage your appointments, track your donation history in real
              time, and eliminate confusion or delays in the donation process.
            </p>
          </div>
          <div className="mt-6 flex w-full rounded-[40px] border border-border bg-white shadow-sm dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:mt-46.75">
            <form className="ml-7 flex w-full items-center gap-4" action="">
              <Input
                name="waitlist-email-top"
                type="email"
                value={topEmail}
                onChange={(e) => setTopEmail(e.target.value)}
                placeholder="Your email address"
                icon={
                  <Image
                    src="/icons/outline-email.svg"
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden
                  />
                }
                containerClassName="min-w-0 flex-1 border-0 bg-transparent shadow-none"
                inputClassName="bg-transparent text-[#111827] placeholder:text-[#9CA3AF] dark:text-white dark:placeholder:text-slate-500"
              />
              <Button
                type="submit"
                className="rounded-[40px] px-8 py-5 text-base leading-6.75 text-nowrap"
              >
                Get Early Access
              </Button>
            </form>
          </div>
        </div>
        <div className="flex md:justify-end">
          <div className="mt-auto flex h-133.25 w-full max-w-89 items-center justify-center rounded-[70px] bg-primary dark:bg-[#7A0014]">
            <div className="relative w-[90%] sm:w-full max-w-70.5 h-146.75 -mt-32.5">
              <Image src="/images/sample.png" alt="blivap mobile" fill />
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-23.5 flex h-95.5 w-full justify-center rounded-[30px] bg-black bg-cover px-2 dark:border dark:border-white/10 dark:bg-[#111827] lg:px-35.75">
        {/* <Image
          className="mt-2.5 w-75"
          src="/icons/ring.svg"
          alt="ring"
          fill
        /> */}
        <div className="mt-16 text-center w-full ">
          <p className="text-3xl tracking-[-0.14px] text-text-inverse dark:text-white">
            We Made Blood and Spam Donation{" "}
            <span className="bg-primary p-2.5">Easier!</span>
          </p>
          <div className="grid grid-cols-3 items-center justify-center content-center mt-10  lg:mt-20  lg:gap-8 gap-2  w-full  ">
            <div className="relative place-self-center flex max-h-107.5 w-full max-w-77 scale-[0.8] flex-col justify-center gap-1 rounded-lg bg-[#F5F5F5] p-3 text-center dark:border dark:border-white/10 dark:bg-[#0F172A] md:gap-16 md:rounded-[40px] md:px-5 md:pt-10 sm:scale-none">
              <p className="mx-auto max-w-42.5 font-medium leading-5.5 text-base dark:text-white sm:text-xl">
                Available Donors; a piece of cake!
              </p>
              <div className="relative flex flex-col justify-center items-center  h-full">
                <Image
                  className="-mt-12.5"
                  src="/icons/ring_2.svg"
                  alt="ring"
                  fill
                />

                <Image
                  className="mt-auto relative"
                  src="/images/app-example-donors.png"
                  alt="example"
                  width={176.05}
                  height={270}
                />
              </div>
            </div>
            <div className="relative place-self-center flex max-h-107.5 w-full max-w-77 scale-[0.8] flex-col justify-center gap-1 rounded-lg bg-[#F5F5F5] p-3 text-center dark:border dark:border-white/10 dark:bg-[#0F172A] md:gap-16 md:rounded-[40px] md:px-5 md:pb-10 sm:scale-none">
              <div className="relative flex flex-col justify-center items-center  h-full rotate-180">
                <Image
                  className="-mt-12.5"
                  src="/icons/ring_2.svg"
                  alt="ring"
                  fill
                />

                <Image
                  className="mt-auto relative"
                  src="/images/app-example-donors.png"
                  alt="example"
                  width={176.05}
                  height={270}
                />
              </div>
              <p className="mx-auto max-w-42.5 font-medium leading-5.5 text-base dark:text-white sm:text-[20px]">
                Becoming a Donor easier than ever!
              </p>
            </div>
            <div className="relative place-self-center flex max-h-107.5 w-full max-w-77 scale-[0.8] flex-col justify-center gap-1 rounded-lg bg-[#F5F5F5] p-3 text-center dark:border dark:border-white/10 dark:bg-[#0F172A] md:gap-16 md:rounded-[40px] md:px-5 md:pt-10 sm:scale-none">
              <p className="mx-auto max-w-42.5 font-medium leading-5.5 text-base dark:text-white sm:text-[20px]">
                Earning Money While saving a life!
              </p>
              <div className="relative flex flex-col justify-center items-center  h-full">
                <Image
                  className="-mt-12.5"
                  src="/icons/ring_2.svg"
                  alt="ring"
                  fill
                />

                <Image
                  className="mt-auto relative"
                  src="/images/app-example-donors.png"
                  alt="example"
                  width={176.05}
                  height={270}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center relative text-center mt-81.25">
        <p className="font-bold text-3xl leading-10 dark:text-white">
          To be released on AppStore & Google Play Store soon....
        </p>
        <div className="relative flex flex-col justify-center items-center  h-full mt-36.5">
          <Image
            className="-mt-27.5!"
            src="/icons/ring_2.svg"
            alt="ring"
            width={591}
            height={603}
          />
          <div className=" absolute -mb-50 md:-mb-82.5 w-[70%] sm:w-auto">
            <Image
              src="/images/preview.png"
              alt="example"
              width={411}
              height={855.52}
            />
          </div>
        </div>
      </div>
      <div className="relative flex w-full flex-col justify-between gap-6 rounded-t-[40px] bg-[#F5F5F5] p-3 pt-4 dark:bg-[#0F172A] md:flex-row md:px-15.75 md:pt-14.5 md:pb-17.25">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-4xl text-primary font-helvetica">
              Blivap
            </p>
            <p className="max-w-85.75 text-lg leading-5.5 text-[#959595] dark:text-slate-400">
              Blivap is a Blood Donation App Service Inc. company 2022
            </p>
          </div>
          <div className="flex w-full rounded-[40px] bg-white dark:border dark:border-white/10 dark:bg-[#111827]">
            <form
              className="ml-2 flex w-full items-center gap-4 md:ml-7"
              action=""
            >
              <Input
                name="waitlist-email-footer"
                type="email"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder="Your email address"
                icon={
                  <Image
                    src="/icons/outline-email.svg"
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden
                  />
                }
                containerClassName="min-w-0 flex-1 border-0 bg-transparent shadow-none"
                inputClassName="bg-transparent text-[#111827] placeholder:text-[#9CA3AF] dark:text-white dark:placeholder:text-slate-500"
              />
              <Button
                type="submit"
                className="rounded-[40px] p-2 text-base leading-6.75 text-nowrap sm:px-8 sm:py-5.5"
              >
                Get Early Access
              </Button>
            </form>
          </div>
        </div>
        <div className="flex gap-2 md:gap-6 justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg text-black dark:text-white">
              About Product
            </p>
            <ul className="flex flex-col gap-3">
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Patch
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Updates
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Careers
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg text-black dark:text-white">
              Company
            </p>
            <ul className="flex flex-col gap-3">
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Patch
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Updates
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Beta Test
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg text-black dark:text-white">
              Support
            </p>
            <ul className="flex flex-col gap-3">
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Help Center
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Account Information
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Early Access
              </li>
              <li className="text-[#959595] text-base leading-6.75 dark:text-slate-400">
                Talk to support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
