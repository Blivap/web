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
    <div className="relative flex justify-center items-center  w-full flex-1  ">
 
    
      <motion.div 
        className="flex flex-col gap-10 relative w-full max-w-[732px] bg-white  rounded-3xl p-4 md:px-16 pt-12 md:pb-[52px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex rounded-xl overflow-hidden w-full bg-[#111111]/25">
          <motion.div
            onClick={() => handleTabChange("register")}
            className={classNames("py-4  w-1/2 text-center cursor-pointer", {
              "bg-[#111111]": activeTab !== "login",
            })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-white text-[18px]">Sign up</p>
          </motion.div>
          <motion.div
            onClick={() => handleTabChange("login")}
            className={classNames("py-4  w-1/2 text-center cursor-pointer", {
              "bg-[#111111]": activeTab === "login",
            })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-white text-[18px]">Log in</p>
          </motion.div>
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
      <div className="w-1/2 bg-[#960018] rounded-l-[60px] h-full"></div>
    </div>
  );
}
