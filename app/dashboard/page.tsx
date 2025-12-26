"use client";
import { Layout } from "../components/layout/layout.component";
import { ArrowRight, ArrowUpToLine, Droplet, Plus } from "lucide-react";
import { Avatar } from "../components/Avatar/avatar.component";
import { FaStar } from "react-icons/fa";
import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

export default function Dashboard() {
  const [visible, setVisible] = useState(false);
  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <div className="grid xl:grid-cols-6 gap-5 w-full">
          <div className=" col-span-3 xl:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-6 relative bg-primary rounded-2xl w-full  px-4 pt-2 pb-3.5 sm:pt-11 sm:px-12 sm:pb-11  bg-[url('/public/images/background_pattern.png')]">
              {/* <Image
                src="/images/group.png"
                alt="background pattern"
                width={200}
                height={200}
              /> */}
              <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-[#FFFFFFB2]">My portfolio</p>
                  <div className=" flex  items-baseline">
                    <p className="font-bold text-3xl text-white">
                      {visible ? "₦250,000" : "******"}
                    </p>
                    <span
                      className="text-[#FFFFFF80] ml-2 text-lg"
                      onClick={() => setVisible((prev) => !prev)}
                    >
                      {visible ? <BsEye /> : <BsEyeSlash />}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className="text-white"
                  strokeWidth={1.3}
                  size={24}
                />
              </div>
              <div className="flex gap-6">
                <button className="flex items-center gap-1 text-xs text-white py-2 bg-[#B05E5E] rounded-[20px] px-2.5">
                  <ArrowUpToLine size={16} />
                  <p>Withdraw</p>
                </button>
                <button className="flex items-center gap-1 text-xs text-white py-2 bg-[#B05E5E] rounded-[20px] px-2.5">
                  <Plus size={16} />
                  <p>Add Money</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 grid-rows-1 gap-5">
              <div className="flex flex-col gap-4">
                <p className="font-medium text-xl hidden sm:block">
                  Register as a new Donor
                </p>
                <div className="bg-white rounded-2xl  shadow-[0_4px_4px_#0000001A] py-2 px-3 sm:p-3 h-full">
                  <div className="flex flex-col items-center justify-center sm:border border-[#DADADA] rounded-[10px] h-full gap-3.5  sm:gap-[38px] sm:p-2">
                    <div className="size-14 bg-[#F9E8EE] rounded-full" />
                    <div className="flex flex-col sm:gap-3.5 text-center">
                      <p className="text-xs sm:text-xl font-semibold ">
                        Register as a new donor
                      </p>
                      <p className="text-xs sm:text-base text-[#333333]">
                        You want to register as a donor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-medium text-xl hidden sm:block">
                  {" "}
                  Book an appointment
                </p>
                <div className="bg-white rounded-2xl  shadow-[0_4px_4px_#0000001A] py-2 px-3 sm:p-3 h-full">
                  <div className="flex flex-col items-center justify-center sm:border border-[#DADADA] rounded-[10px] h-full gap-3.5  sm:gap-[38px] sm:p-2">
                    <div className="size-14 bg-[#E4E5FF] rounded-full" />
                    <div className="flex flex-col sm:gap-3.5 text-center">
                      <p className="text-xs sm:text-xl font-semibold ">
                        I want an appointment
                      </p>
                      <p className="text-xs sm:text-base text-[#333333]">
                        You want to come and donate (again)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 h-full">
              <div className="flex justify-between">
                <p className="font-medium text-sm sm:text-xl">
                  Available donors
                </p>
                <p className="font-medium text-sm sm:text-base text-[#960018]">
                  {" "}
                  View All
                </p>
              </div>
              <div className="grid gap-4  flex-1 h-full max-h-[400px] overflow-auto">
                {Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 bg-white rounded-[10px] p-2.5 "
                    >
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <Avatar className="hidden sm:flex" />
                          <div className="flex flex-col">
                            <p className="font-medium">811532</p>
                            <div className="flex gap-7 mt-2">
                              <div className="flex gap-1 items-center">
                                <FaStar className="text-[#FFD000]" />
                                <p className="text-xs md:text-base font-medium text-[#6B7280]">
                                  4.8
                                </p>
                              </div>
                              <div className="flex gap-1 items-center">
                                <Droplet
                                  className=" text-[#960018]"
                                  size={12}
                                />
                                <p className="text-xs md:text-base leading-[22px] font-medium text-[#6B7280]">
                                  4 donations
                                </p>
                              </div>
                            </div>
                            <p className="text-xs md:text-sm  text-[#6B7280] font-medium">
                              Abuja, Nigeria
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="px-1 py-px rounded-full bg-[#FFE2E2] font-medium text-xs leading-[22px] size-fit">
                            o+
                          </div>
                          <p className="text-xs md:text-base font-medium text-[#6B7280]">
                            ₦ 750,000 per unit
                          </p>
                        </div>
                      </div>
                      <div className="flex  justify-end">
                        <button className="w-full sm:w-auto rounded-[10px] bg-primary py-2.5 px-11 text-white font-medium text-sm">
                          Book an appointment
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="col-span-3 xl:col-span-2 flex flex-col gap-8 ">
            <div className="md:flex flex-col gap-8 rounded-2xl  bg-white  shadow-[0_0_4px_#00000026] p-6 hidden">
              <div className="flex justify-between">
                <p className="font-medium text-base">Your Donations</p>
                <p className="text-sm">Amount made</p>
              </div>
              <div className="flex flex-col gap-6">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="h-2 rounded-lg bg-primary w-5" />
                      <div className="flex items-center gap-4 justify-between w-full">
                        <div className="flex gap-4">
                          <Avatar />
                          <div className="flex flex-col ">
                            <p className="text-sm">Blood Donation</p>{" "}
                            <p className="text-sm text-[#6B7280]">
                              1 packs
                            </p>{" "}
                          </div>
                        </div>
                        <div className="bg-[#FFE2E2] rounded-[20px] p-2 text-sm">
                          <p>₦750,000</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-8 rounded-2xl  bg-white  shadow-[0_0_4px_#00000026] p-6">
              <div className="flex justify-between">
                <p className="font-medium text-base">Recent donors</p>
                <p className="text-sm">Amount made</p>
              </div>
              <div className="flex flex-col gap-6">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="h-2 rounded-lg bg-primary w-5 hidden sm:block" />
                      <div className="flex items-center gap-4 justify-between w-full">
                        <div className="flex gap-4">
                          <Avatar className="size-10 sm:size-11" />
                          <div className="flex flex-col ">
                            <p className="text-sm">811532</p>{" "}
                            <p className="text-sm text-[#6B7280]">
                              1 packs
                            </p>{" "}
                          </div>
                        </div>
                        <div className="bg-[#FFE2E2] rounded-[20px] p-2 text-sm">
                          <p>₦750,000</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
