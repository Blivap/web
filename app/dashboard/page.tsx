import Image from "next/image";
import { Layout } from "../components/layout/layout.component";
import { Bell, Droplet, Search } from "lucide-react";
import { Avatar } from "../components/Avatar/avatar.component";
import { FaStar } from "react-icons/fa";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-3 items-center rounded-[44px] bg-white py-4 px-6 w-full max-w-[461px]">
            <Search className="text-[#ABAAAF]" size={24} />
            <input
              className="outline-none text-base placeholder:text-[#ABAAAF] w-full h-full"
              type="text"
              placeholder="Search Item, Collection and Account.."
            />
          </div>
          <div className="flex gap-6">
            <div className="relative border border-[#F3F2F3] rounded-full bg-white sm:p-4 p-2  ">
              <div className="absolute size-1.5 bg-[#5429FF] rounded-full right-5" />
              <Bell size={24} strokeWidth={1.2} />
            </div>
            <Avatar className="size-12" />
          </div>
        </div>
        <div className="grid xl:grid-cols-6 gap-5 w-full">
          <div className=" col-span-3 xl:col-span-4 flex flex-col gap-6">
            <div className="relative bg-primary rounded-2xl w-full h-[275px]">
              <Image
                src="/images/background_pattern.png"
                alt="background pattern"
                fill
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-4">
                <p className="font-medium text-xl">Register as a new Donor</p>
                <div className="bg-white rounded-2xl h-[220px] shadow-[0_4px_4px_#0000001A] p-3">
                  <div className="flex flex-col items-center justify-center border border-[#DADADA] rounded-[10px] h-full gap-[38px] p-2">
                    <div className="size-[54px] bg-[#F9E8EE] rounded-full" />
                    <div className="flex flex-col gap-3.5 text-center">
                      <p className="text-xl  ">Register as a new donor</p>
                      <p className="text-[15px] text-[#333333]">
                        You want to register as a donor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-medium text-xl"> Book an appointment</p>
                <div className="bg-white rounded-2xl h-[220px] shadow-[0_4px_4px_#0000001A] p-3">
                  <div className="flex flex-col items-center justify-center border border-[#DADADA] rounded-[10px] h-full gap-[38px] p-2">
                    <div className="size-[54px] bg-[#E4E5FF] rounded-full" />
                    <div className="flex flex-col gap-3.5 text-center">
                      <p className="text-xl  ">I want an appointment</p>
                      <p className="text-[15px] text-[#333333]">
                        You want to come and donate (again)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 h-full">
              <div className="flex justify-between">
                <p className="font-medium text-xl">Available donors</p>
                <p className="font-medium text-base text-[#960018]">
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
                          <Avatar />
                          <div className="flex flex-col">
                            <p className="font-medium">Sarah</p>
                            <div className="flex gap-[27px] mt-[7px]">
                              <div className="flex gap-1 items-center">
                                <FaStar className="text-[#FFD000]" />
                                <p className="font-medium text-[#6B7280]">
                                  4.8
                                </p>
                              </div>
                              <div className="flex gap-1 items-center">
                                <Droplet
                                  className=" text-[#960018]"
                                  size={12}
                                />
                                <p className="font-medium text-[#6B7280]">
                                  4 donations
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-[#6B7280] font-medium">
                              Abuja, Nigeria
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-[7px]">
                          <div className="px-[4.5px] py-px rounded-full bg-[#FFE2E2] font-medium text-[10px] leading-[22px] size-fit">
                            o+
                          </div>
                          <p className="font-medium text-[#6B7280]">
                            ₦ 750,000 per unit
                          </p>
                        </div>
                      </div>
                      <div className="flex  justify-end">
                        <button className="rounded-[10px] bg-primary py-2.5 px-[42.5px] text-white font-medium text-sm">
                          Book an appointment
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="col-span-3 xl:col-span-2 flex flex-col gap-8 ">
            <div className="flex flex-col gap-8 rounded-2xl  bg-white  shadow-[0_0_4px_#00000026] p-6">
              <div className="flex justify-between">
                <p className="font-medium text-base">Your Donations</p>
                <p className="text-sm">Amount made</p>
              </div>
              <div className="flex flex-col gap-6">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="h-[9px] rounded-[9px] bg-primary w-5" />
                      <div className="flex items-center gap-4 justify-between w-full">
                        <div className="flex gap-4">
                          <Avatar />
                          <div className="flex flex-col ">
                            <p className="text-sm">Blood Donation</p>{" "}
                            <p className="text-sm text-[#6B7280]">1 packs</p>{" "}
                          </div>
                        </div>
                        <div className="bg-[#FFE2E2] rounded-[20px] p-[7px] text-sm">
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
                      <div className="h-[9px] rounded-[9px] bg-primary w-5" />
                      <div className="flex items-center gap-4 justify-between w-full">
                        <div className="flex gap-4">
                          <Avatar />
                          <div className="flex flex-col ">
                            <p className="text-sm">Blood Donation</p>{" "}
                            <p className="text-sm text-[#6B7280]">1 packs</p>{" "}
                          </div>
                        </div>
                        <div className="bg-[#FFE2E2] rounded-[20px] p-[7px] text-sm">
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
