import Image from "next/image";

export const Splash = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Image
        alt="logo"
        height={200}
        width={200}
        src="/logo.png"
        className="mx-auto animate-pulse duration-200 ease-in-out logo-animation"
      />
    </div>
  );
};
