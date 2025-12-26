"use client";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { LoginTab } from "../components/authtab/login-tab.component";
import { RegisterTab } from "../components/authtab/register-tab.component";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="relative flex justify-center items-center bg-[#F5B1B1] w-full flex-1 backdrop-blur-[76px] p-3 md:py-[116px]">
      <Image src="/images/auth_bg.png" alt="background" fill />
      <motion.div
        onClick={router.back}
<<<<<<< HEAD
        className=" border-[0.7px] border-[#960018] absolute z-10 rounded-full size-6 lg:size-[45px] top-6 left-5 sm:left-8 lg:top-[122px] lg:left-[83px] flex justify-center items-center bg-[#FBFBFB59] text-[#960018] cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft strokeWidth={1} size={20} />
      </motion.div>
      <motion.div 
        className="flex flex-col gap-10 relative w-full max-w-[732px] bg-white  rounded-3xl p-4 md:px-16 pt-12 md:pb-[52px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
=======
        className=" border border-[#960018] absolute z-10 rounded-full size-6 lg:size-11 top-6 left-5 sm:left-8 lg:top-[122px] lg:left-[83px] flex justify-center items-center bg-[#FBFBFB59] text-[#960018]"
      >
        <ArrowLeft strokeWidth={1} size={20} />
      </div>
      <div className="flex flex-col gap-10 relative w-full max-w-[732px] bg-white  rounded-3xl p-4 md:px-16 pt-12 md:pb-13">
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
        <div className="flex rounded-xl overflow-hidden w-full bg-[#111111]/25">
          <motion.div
            onClick={() => handleTabChange("register")}
            className={classNames("py-4  w-1/2 text-center cursor-pointer", {
              "bg-[#111111]": activeTab !== "login",
            })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
<<<<<<< HEAD
            <p className="text-white text-[18px]">Sign up</p>
          </motion.div>
          <motion.div
=======
            <p className="text-white text-lg">Sign up</p>
          </div>
          <div
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
            onClick={() => handleTabChange("login")}
            className={classNames("py-4  w-1/2 text-center cursor-pointer", {
              "bg-[#111111]": activeTab === "login",
            })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
<<<<<<< HEAD
            <p className="text-white text-[18px]">Log in</p>
          </motion.div>
=======
            <p className="text-white text-lg">Log in</p>
          </div>
>>>>>>> bdc9cb24c25b1f7b49ec93466a597447b4e79653
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            className="flex  justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab !== "login" ? <RegisterTab /> : <LoginTab />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
