import Image from "next/image";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex justify-center  items-center  w-full ">
      <div className="flex justify-center w-full    md:px-10 xl:px-23 py-6 px-3">
        {children}
      </div>
      <div className="w-full hidden lg:block"/>
      <div className="fixed hidden lg:flex justify-center items-center  w-1/2 right-0 top-0   bg-[#960018] rounded-l-[60px] h-full overflow-hidden self-end">
        <Image
          src="/images/authbg.jpg"
          alt="Auth bg"
          fill
          priority
          className={`
                    object-cover
                    transition-opacity duration-700
                    rounded-l-[60px]
                    opacity-0
                    data-[loaded=true]:opacity-[0.6]
                    `}
          onLoad={(e) => (e.currentTarget.dataset.loaded = "true")}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="grid gap-6 bg-[#FFFFFF33] px-11.5 py-[76.5px] relative backdrop-blur-[30px] max-w-139">
          <p className="text-[48px] text-white font-semibold">
            Connecting People to Donors
          </p>
          <p className="text-[18px] text-[#F6F6F8]">
            Discover endless opportunities to receive blood and sperm donation.
          </p>
        </div>
      </div>
    </div>
  );
};
