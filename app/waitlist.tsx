import Image from "next/image";

export const WaitList = () => {
  return (
    <div className="px-2 pt-2.5 max-w-[1277px]">
      <div className="flex items-center justify-between">
        <p className="text-primary font-bold text-3xl md:text-5xl leading-[22px]">
          Blivap
        </p>
        <div className="py-2 px-3.5 bg-primary rounded-[20px]">
          <p className="text-sm text-text-inverse">Get Early Access</p>
        </div>
      </div>
      <div className="mt-20 grid md:grid-cols-2 gap-40 sm:gap-2">
        <div>
          <div className=" ">
            <p className=" text-[40px] md:text-[56px] ">
              Are you Ready for a revolution in the <br />
              <span className="font-bold">Medical industry?</span>{" "}
              <span className="text-primary">Explore us</span>
            </p>
            <p className="mt-[60px] text-base leading-[27px] text-text-tertiary">
              Blood and sperm donors – use our platform and donor ID cards to
              manage your appointments, track your donation history in real
              time, and eliminate confusion or delays in the donation process.
            </p>
          </div>
          <div className="mt-6 md:mt-[187px] flex border border-border rounded-[40px] w-full">
            <form className="flex w-full gap-4 ml-7" action="">
              <Image
                src="/icons/outline-email.svg"
                alt="icon"
                width={32}
                height={32}
              />
              <input
                className="w-full outline-none min-w-0"
                type="text"
                placeholder="Your email address"
                name=""
                id=""
              />
              <button
                type="submit"
                className="bg-primary text-text-inverse text-base leading-[27px] rounded-[40px] px-[32px] py-[22px] text-nowrap"
              >
                Get Early Access
              </button>
            </form>
          </div>
        </div>
        <div className="flex md:justify-end">
          <div className="flex justify-center items-center bg-primary w-full max-w-[356px] h-[533px] rounded-[70px] mt-auto">
            <div className="relative w-[90%] sm:w-full max-w-[282px] h-[587px] -mt-[130px]">
              <Image src="/images/sample.png" alt="blivap mobile" fill />
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex justify-center  mt-[94px] w-full bg-black bg-cover rounded-[30px] h-[382px] px-2 lg:px-[143px] ">
        {/* <Image
          className="mt-2.5 w-[300px]"
          src="/icons/ring.svg"
          alt="ring"
          fill
        /> */}
        <div className="mt-16 text-center w-full ">
          <p className="text-text-inverse text-[32px]  tracking-[-0.14px]">
            We Made Blood and Spam Donation{" "}
            <span className="bg-primary p-2.5">Easier!</span>
          </p>
          <div className="grid grid-cols-3 items-center justify-center content-center mt-10  lg:mt-[78px]  lg:gap-[33px] gap-2  w-full  ">
            <div className="flex flex-col md:gap-[71px] gap-1  place-self-center  justify-center relative text-center rounded-lg  md:rounded-[40px] bg-[#F5F5F5] max-h-[430px]  w-full max-w-[308px]  p-3  md:px-[21px] md:pt-10 scale-[0.8] sm:scale-none">
              <p className="max-w-[170px] font-medium text-base sm:text-[20px] mx-auto leading-[22px]">
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
            <div className="flex flex-col md:gap-[71px] gap-1  place-self-center justify-center relative text-center  rounded-lg  md:rounded-[40px] bg-[#F5F5F5] max-h-[430px] w-full  max-w-[308px]   p-3  md:px-[21px] md:pb-10 scale-[0.8] sm:scale-none">
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
              <p className="max-w-[170px] font-medium text-base sm:text-[20px]  mx-auto leading-[22px]">
                Becoming a Donor easier than ever!
              </p>
            </div>
            <div className=" flex flex-col   md:gap-[71px] gap-1 place-self-center justify-center relative text-center rounded-lg  md:rounded-[40px] bg-[#F5F5F5] max-h-[430px] w-full  max-w-[308px] p-3  md:px-[21px] md:pt-10 scale-[0.8] sm:scale-none">
              <p className="max-w-[170px] font-medium text-base sm:text-[20px]  mx-auto leading-[22px]">
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
        <p className=" font-bold text-[32px] leading-10 ">
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
      <div className="relative flex flex-col md:flex-row justify-between w-full  bg-[#F5F5F5] rounded-t-[40px] p-3 pt-4 md:pt-[58px] md:px-[63px] md:pb-[69px] gap-6">
        <div className="flex flex-col gap-[31px]">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-[40px] text-primary">Blivap</p>
            <p className="max-w-[343px] text-[18px] leading-[22px] text-[#959595]">
              Blivap is a Blood Donation App Service Inc. company 2022
            </p>
          </div>
          <div className=" flex bg-white rounded-[40px] w-full">
            <form className="flex w-full gap-4 ml-2 md:ml-7" action="">
              <Image
                src="/icons/outline-email.svg"
                alt="icon"
                width={32}
                height={32}
              />
              <input
                className="w-full outline-none min-w-0"
                type="text"
                placeholder="Your email address"
                name=""
                id=""
              />
              <button
                type="submit"
                className="bg-primary text-text-inverse text-base leading-[27px] rounded-[40px] p-2  sm:px-8 sm:py-[22px] text-nowrap"
              >
                Get Early Access
              </button>
            </form>
          </div>
        </div>
        <div className="flex gap-2 md:gap-6 justify-between">
          <div className="flex flex-col gap-[11px]">
            <p className="font-bold text-lg text-black">About Product</p>
            <ul className="flex flex-col gap-[11px]">
              <li className="text-[#959595] text-base leading-[27px]">Patch</li>
              <li className="text-[#959595] text-base leading-[27px]">
                Updates
              </li>
              <li className="text-[#959595] text-base leading-[27px]">
                Careers
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-[11px]">
            <p className="font-bold text-lg text-black">Company</p>
            <ul className="flex flex-col gap-[11px]">
              <li className="text-[#959595] text-base leading-[27px]">Patch</li>
              <li className="text-[#959595] text-base leading-[27px]">
                Updates
              </li>
              <li className="text-[#959595] text-base leading-[27px]">
                Beta Test
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-[11px]">
            <p className="font-bold text-lg text-black">Support</p>
            <ul className="flex flex-col gap-[11px]">
              <li className="text-[#959595] text-base leading-[27px]">
                Help Center
              </li>
              <li className="text-[#959595] text-base leading-[27px]">
                Account Information
              </li>
              <li className="text-[#959595] text-base leading-[27px]">
                Early Access
              </li>
              <li className="text-[#959595] text-base leading-[27px]">
                Talk to support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
