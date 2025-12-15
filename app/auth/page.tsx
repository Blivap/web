"use client";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { LoginTab } from "../components/authtab/login-tab.component";
import { RegisterTab } from "../components/authtab/register-tab.component";
type Tab = "login" | "register";
export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab: Tab =
    searchParams.get("tab") === "login" ? "login" : "register";

  const handleTabChange = (tab: Tab) => {
    router.push(`?tab=${tab}`, { scroll: false });
  };
  return (
    <div className="relative flex justify-center items-center bg-[#F5B1B1] w-full flex-1 backdrop-blur-[76px] p-3">
      <Image src="/images/auth_bg.png" alt="background" fill />
      <div
        onClick={router.back}
        className=" border-[0.7px] border-[#960018] absolute z-10 rounded-full size-6 md:size-[45px] top-6 left-5 md:top-[122px] md:left-[83px] flex justify-center items-center bg-[#FBFBFB59] text-[#960018]"
      >
        <ArrowLeft strokeWidth={1} size={20} />
      </div>
      <div className="flex flex-col gap-10 relative w-full max-w-[732px] bg-white  rounded-3xl p-4 md:px-16 pt-12 md:pb-[52px]">
        <div className="flex rounded-xl overflow-hidden w-full bg-[#111111]/25">
          <div
            onClick={() => handleTabChange("register")}
            className={classNames("py-4  w-1/2 text-center", {
              "bg-[#111111]": activeTab !== "login",
            })}
          >
            <p className="text-white text-[18px]">Sign up</p>
          </div>
          <div
            onClick={() => handleTabChange("login")}
            className={classNames("py-4  w-1/2 text-center", {
              "bg-[#111111]": activeTab === "login",
            })}
          >
            <p className="text-white text-[18px]">Log in</p>
          </div>
        </div>
        <div className="flex  justify-center">
          {activeTab !== "login" ? <RegisterTab /> : <LoginTab />}
        </div>
      </div>
    </div>
  );
}
