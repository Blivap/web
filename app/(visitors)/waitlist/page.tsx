import Image from "next/image";

export default function WaitList() {
  return (
    <div className="mx-auto max-w-[1277px] px-2 pt-2.5 text-[#111827] dark:text-white">
      <div className="flex items-center justify-between">
        <p className="font-helvetica text-primary font-bold text-3xl md:text-5xl leading-[22px]">
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
            <p className="mt-[60px] text-base leading-[27px] text-text-tertiary dark:text-slate-400">
              Blood and sperm donors – use our platform and donor ID cards to
              manage your appointments, track your donation history in real
              time, and eliminate confusion or delays in the donation process.
            </p>
          </div>
          <div className="mt-6 flex w-full rounded-[40px] border border-border bg-white shadow-sm dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:mt-[187px]">
            <form className="ml-7 flex w-full items-center gap-4" action="">
              <Image
                src="/icons/outline-email.svg"
                alt="icon"
                width={32}
                height={32}
              />
              <input
                className="min-w-0 w-full bg-transparent text-[#111827] outline-none placeholder:text-[#9CA3AF] dark:text-white dark:placeholder:text-slate-500"
                type="text"
                placeholder="Your email address"
                name=""
                id=""
              />
              <button
                type="submit"
                className="rounded-[40px] bg-primary px-8 py-5 text-base leading-[27px] text-nowrap text-text-inverse transition-colors hover:bg-primary/90"
              >
                Get Early Access
              </button>
            </form>
          </div>
        </div>
        <div className="flex md:justify-end">
          <div className="mt-auto flex h-[533px] w-full max-w-[356px] items-center justify-center rounded-[70px] bg-primary dark:bg-[#7A0014]">
            <div className="relative w-[90%] sm:w-full max-w-[282px] h-[587px] -mt-[130px]">
              <Image src="/images/sample.png" alt="blivap mobile" fill />
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-[94px] flex h-[382px] w-full justify-center rounded-[30px] bg-black bg-cover px-2 dark:border dark:border-white/10 dark:bg-[#111827] lg:px-[143px]">
        {/* <Image
          className="mt-2.5 w-[300px]"
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
            <div className="relative place-self-center flex max-h-[430px] w-full max-w-[308px] scale-[0.8] flex-col justify-center gap-1 rounded-lg bg-[#F5F5F5] p-3 text-center dark:border dark:border-white/10 dark:bg-[#0F172A] md:gap-16 md:rounded-[40px] md:px-5 md:pt-10 sm:scale-none">
              <p className="mx-auto max-w-[170px] font-medium leading-[22px] text-base dark:text-white sm:text-xl">
                Available Donors; a piece of cake!
              </p>
              <div className="relative flex flex-col justify-center items-center  h-full">
                <Image
                  className="-mt-[50px]"
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
            <div className="relative place-self-center flex max-h-[430px] w-full max-w-[308px] scale-[0.8] flex-col justify-center gap-1 rounded-lg bg-[#F5F5F5] p-3 text-center dark:border dark:border-white/10 dark:bg-[#0F172A] md:gap-16 md:rounded-[40px] md:px-5 md:pb-10 sm:scale-none">
              <div className="relative flex flex-col justify-center items-center  h-full rotate-180">
                <Image
                  className="-mt-[50px]"
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
              <p className="mx-auto max-w-[170px] font-medium leading-[22px] text-base dark:text-white sm:text-[20px]">
                Becoming a Donor easier than ever!
              </p>
            </div>
            <div className="relative place-self-center flex max-h-[430px] w-full max-w-[308px] scale-[0.8] flex-col justify-center gap-1 rounded-lg bg-[#F5F5F5] p-3 text-center dark:border dark:border-white/10 dark:bg-[#0F172A] md:gap-16 md:rounded-[40px] md:px-5 md:pt-10 sm:scale-none">
              <p className="mx-auto max-w-[170px] font-medium leading-[22px] text-base dark:text-white sm:text-[20px]">
                Earning Money While saving a life!
              </p>
              <div className="relative flex flex-col justify-center items-center  h-full">
                <Image
                  className="-mt-[50px]"
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

      <div className="flex flex-col justify-center relative text-center mt-[325px]">
        <p className="font-bold text-3xl leading-10 dark:text-white">
          To be released on AppStore & Google Play Store soon....
        </p>
        <div className="relative flex flex-col justify-center items-center  h-full mt-[146px]">
          <Image
            className="-mt-[110px]!"
            src="/icons/ring_2.svg"
            alt="ring"
            width={591}
            height={603}
          />
          <div className=" absolute -mb-[200px] md:-mb-[330px] w-[70%] sm:w-auto">
            <Image
              src="/images/preview.png"
              alt="example"
              width={411}
              height={855.52}
            />
          </div>
        </div>
      </div>
      <div className="relative flex w-full flex-col justify-between gap-6 rounded-t-[40px] bg-[#F5F5F5] p-3 pt-4 dark:bg-[#0F172A] md:flex-row md:px-[63px] md:pt-[58px] md:pb-[69px]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-4xl text-primary font-helvetica">
              Blivap
            </p>
            <p className="max-w-[343px] text-lg leading-[22px] text-[#959595] dark:text-slate-400">
              Blivap is a Blood Donation App Service Inc. company 2022
            </p>
          </div>
          <div className="flex w-full rounded-[40px] bg-white dark:border dark:border-white/10 dark:bg-[#111827]">
            <form
              className="ml-2 flex w-full items-center gap-4 md:ml-7"
              action=""
            >
              <Image
                src="/icons/outline-email.svg"
                alt="icon"
                width={32}
                height={32}
              />
              <input
                className="min-w-0 w-full bg-transparent text-[#111827] outline-none placeholder:text-[#9CA3AF] dark:text-white dark:placeholder:text-slate-500"
                type="text"
                placeholder="Your email address"
                name=""
                id=""
              />
              <button
                type="submit"
                className="rounded-[40px] bg-primary p-2 text-base leading-[27px] text-nowrap text-text-inverse transition-colors hover:bg-primary/90 sm:px-8 sm:py-[22px]"
              >
                Get Early Access
              </button>
            </form>
          </div>
        </div>
        <div className="flex gap-2 md:gap-6 justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg text-black dark:text-white">
              About Product
            </p>
            <ul className="flex flex-col gap-3">
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Patch
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Updates
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Careers
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg text-black dark:text-white">
              Company
            </p>
            <ul className="flex flex-col gap-3">
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Patch
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Updates
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Beta Test
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg text-black dark:text-white">
              Support
            </p>
            <ul className="flex flex-col gap-3">
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Help Center
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Account Information
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Early Access
              </li>
              <li className="text-[#959595] text-base leading-[27px] dark:text-slate-400">
                Talk to support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
