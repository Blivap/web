"use client";
import Image from "next/image";

export default function Home() {
  const randomizer = () => Math.floor(Math.random() * 1000).toFixed(1);
  const random = randomizer();
  if (typeof window !== "undefined") {
    return null;
  }
  return (
    <div>
      <div className="px-[30px] pt-5 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Image src="/icons/logo.svg" alt="logo" width={48} height={48} />
          <p className="font-semibold text-base leading-[22px] tracking-[-0.1px]">
            Blivap
          </p>
        </div>
        <div className="flex gap-[30px]">
          {[...Array(5)].map((_, id) => (
            <div key={id}>Routing LInk{id + 1}</div>
          ))}
        </div>
      </div>
      <div className="border-b border-[#DBDBDB]">
        <div className=" flex flex-col items-center gap-[30px] max-w-[730px] mx-auto mt-[130px] text-center">
          <div className="flex flex-col gap-5 ">
            <p className="font-bold text-[48px] leading-[60px] tracking-[-1.2px]">
              Africa’s largest blood & Spam donation platform
            </p>
            <p className="text-xl text-[#585757] leading-[30px]">
              Poster can be one of the effective marketing and advertising
              materials. It is also a great tool to use when you want to present
              your.
            </p>
          </div>
          <div className="flex flex-col gap-5 max-w-[540px]">
            <form className="flex gap-[18px] ">
              <input
                className="border border-[#DBDBDB] rounded-md outline-none bg-none py-[9px] px-[15px] text-xl placeholder:text-[#585757] placeholder:leading-[30px] w-full"
                placeholder="Email"
              />
              <button className="bg-[#24AFB5] rounded-md font-semibold text-xl text-white px-4">
                Subscribe
              </button>
            </form>

            <p className="text-[#969696] text-[13px] leading-[18px] tracking-[-0.1px]">
              No spam, notifications only about new products, updates and
              freebies. You can always unsubscribe.
            </p>
          </div>
          <Image
            src="/images/iphonex.png"
            alt="iphone"
            className="-mb-px z-10"
            width={400}
            height={301}
          />
        </div>
      </div>
      <div className="border-b border-[#DBDBDB]">
        <div className=" flex flex-col items-center gap-[30px] max-w-[730px] mx-auto py-[110px] text-center">
          <p className="font-bold text-4xl leading-[46px] tracking-[-0.8px]">
            Like rock stars, asteroids have been given their fair share of urban
            myth and lore. Many have attributed the extinction of the dinosaurs
            to the impact of a huge asteroid on the earth.{" "}
          </p>
        </div>
      </div>
      <div className="border-b border-[#DBDBDB] py-[110px] px-[145px] grid grid-cols-3 justify-between">
        {[...Array(3)].map((_, id) => (
          <div key={id} className="flex flex-col gap-5  max-w-[350px]">
            <Image
              src="icons/starplaceholder.svg"
              alt="star"
              width={32}
              height={32}
            />
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold text-xl leading-[26px] tracking-[-0.2px]">
                Heading
              </p>
              <p className="text-[15px] leading-[22px] tracking-[-0.2px] ">
                You will likely be required to install the fixed mounts. These
                are what will keep the apparatus stable and secure with your
                computer monitor in it. Follow directions carefully so that you
                can be sure to get everything
              </p>
              <p className="text-[15px] text-[#24AFB5] leading-[22px] tracking-[-0.1px]">
                Learn more
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b border-[#DBDBDB] pt-[110px] pb-[114px] px-[145px] grid grid-cols-3 justify-between gap-y-[60px]">
        {[...Array(5)].map((_, id) => (
          <div key={id} className="flex flex-col gap-2.5 ">
            <p className="font-bold text-[64px] leading-[78px] tracking-[-0.6px]">
              ${random}K
            </p>
            <p>Active Merchants</p>
          </div>
        ))}
      </div>
      <div className="border-b border-[#DBDBDB] py-[110px] px-[145px] flex flex-col items-center gap-[60px]">
        <div className="flex flex-col gap-5 max-w-[730px] text-center">
          <p className="font-bold text-[48px]">Short heading</p>
          <p>
            Each and every one of us has that moment when we are suddenly
            stunned when we come face to face with the enormity of the universe.
          </p>
        </div>
        <div className="flex">
          {[...Array(3)].map((_, id) => (
            <div key={id} className="flex">
              <div className="flex flex-col items-center gap-5  max-w-[350px]">
                <div className="size-24 flex justify-center items-center bg-[#DBDBDB] rounded-full ">
                  <Image
                    src="icons/star.svg"
                    alt="star"
                    width={16}
                    height={15}
                  />
                </div>
                <div className="flex flex-col gap-2.5 text-center">
                  <p className="font-semibold text-xl leading-[26px] tracking-[-0.2px]">
                    Step {id + 1}
                  </p>
                  <p className="text-[15px] leading-[22px] tracking-[-0.2px] ">
                    Third you will likely be required to install the fixed
                    mounts. These are what will keep the apparatus stable and
                    secure.
                  </p>
                </div>
              </div>
              {id <= 1 && (
                <Image
                  src="icons/arrow-right.svg"
                  alt="arrow"
                  width={48}
                  height={48}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="border-b border-[#DBDBDB] pt-[110px] px-[145px] flex justify-between">
        <div className="flex flex-col gap-5  max-w-[540px]">
          <div className="size-24 flex justify-center items-center bg-[#DBDBDB] rounded-full ">
            <Image src="icons/star.svg" alt="star" width={16} height={15} />
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="font-semibold text-xl leading-[26px] tracking-[-0.2px]">
              Heading
            </p>
            <p className="text-xl leading-[30px] tracking-[-0.3px]  text-[#585757]">
              The beauty of astronomy is that anybody can do it. From the
              tiniest baby to the most advanced astrophysicist, there is
              something for anyone who wants to enjoy astronomy.
            </p>
            <p className="text-[15px] text-[#24AFB5] leading-[22px] tracking-[-0.1px]">
              Learn more
            </p>
          </div>
        </div>
        <Image
          src="/images/iphone-x.png"
          alt="iphone"
          className="-mb-px z-10"
          width={470}
          height={301}
        />
      </div>

      <div className="border-b border-[#DBDBDB] py-[110px] px-[145px] grid grid-cols-4 items-stretch">
        {[...Array(4)].map((_, id) => (
          <div key={id} className="flex flex-col gap-2.5 max-w-[255px]">
            <div className="bg-[#DBDBDB] rounded-lg  h-[180px]"></div>
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-[11px] leading-3 tracking-[1px] text-[#969696]">
                  01 May 2020
                </p>
                <p className="font-semibold text-xl leading-[26px] tracking-[-0.2px]">
                  Heading
                </p>
              </div>
              <p className="text-[15px] leading-[22px] tracking-[-0.2px] ">
                You will likely be required to install the fixed mounts. These
                are what will keep the apparatus stable and secure with your
                computer monitor in it. Follow directions carefully so that you
                can be sure to get everything
              </p>
              <div className="flex gap-5 mt-2.5">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/icons/visibility.svg"
                    alt="heart"
                    width={24}
                    height={24}
                  />
                  <p className="text-[15px] text-[#585757] leading-[22px] tracking-[-0.1px]">
                    7.4K
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/icons/message.svg"
                    alt="heart"
                    width={24}
                    height={24}
                  />
                  <p className="text-[15px] text-[#585757] leading-[22px] tracking-[-0.1px]">
                    32
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b border-[#DBDBDB]">
        <div className=" flex flex-col items-center gap-[30px] max-w-[730px] mx-auto mt-[130px] mb-[116px] text-center">
          <div className="flex flex-col gap-5 ">
            <p className="font-bold text-[48px] leading-[60px] tracking-[-1.2px]">
              Two line long header example with text for your another
            </p>
            <p className="text-xl text-[#585757] leading-[30px]">
              Each and every one of us has that moment when we are suddenly
              stunned when we come face to face with the enormity of the
              universe.
            </p>
          </div>
          <div className="flex flex-col gap-5 max-w-[540px]">
            <form className="flex gap-[18px] ">
              <input
                className="border border-[#DBDBDB] rounded-md outline-none bg-none py-[9px] px-[15px] text-xl placeholder:text-[#585757] placeholder:leading-[30px] w-full"
                placeholder="Email"
              />
              <button className="bg-[#24AFB5] rounded-md font-semibold text-xl text-white px-4">
                Subscribe
              </button>
            </form>

            <p className="text-[#969696] text-[13px] leading-[18px] tracking-[-0.1px]">
              No spam, notifications only about new products, updates and
              freebies. You can always unsubscribe.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[60px]  px-[145px] pt-[90px] pb-[108px]">
        <div className="flex items-center gap-2.5">
          <Image src="/icons/logo.svg" alt="logo" width={48} height={48} />
          <p className="font-semibold text-base leading-[22px] tracking-[-0.1px]">
            Blivap
          </p>
        </div>
        <div className="flex justify-between">
          <div className="grid grid-cols-3 gap-[30px]">
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold text-[15px] leading-[22px] tracking-[-0.1px]">
                Category
              </p>
              <ul className="flex flex-col gap-2.5">
                {[...Array(5)].map((_, id) => (
                  <li
                    key={id}
                    className="text-[15px] leading-[22px] tracking-[-0.1px] text-[#585757]"
                  >
                    Footer Link{id + 1}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold text-[15px] leading-[22px] tracking-[-0.1px]">
                Category
              </p>
              <ul className="flex flex-col gap-2.5">
                {[...Array(5)].map((_, id) => (
                  <li
                    key={id}
                    className="text-[15px] leading-[22px] tracking-[-0.1px] text-[#585757]"
                  >
                    Footer Link{id + 1}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold text-[15px] leading-[22px] tracking-[-0.1px]">
                Category
              </p>
              <ul className="flex flex-col gap-2.5">
                {[...Array(5)].map((_, id) => (
                  <li
                    key={id}
                    className="text-[15px] leading-[22px] tracking-[-0.1px] text-[#585757]"
                  >
                    Footer Link{id + 1}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5">
            {[
              { title: "Facebook" },
              { title: "Youtube" },
              { title: "Instagram" },
              { title: "Twitter" },
            ].map((_, id) => (
              <li
                key={id}
                className="flex gap-2.5 items-center text-[15px] leading-[22px] tracking-[-0.1px] text-[#585757]"
              >
                <span>
                  <Image
                    src={`icons/${_.title}.svg`}
                    alt={_.title}
                    width={18}
                    height={18}
                  />
                </span>
                {_.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-between bg-[#F7F7F7] px-[145px] py-5 pb-[22px]">
        <p className="text-[13px] leading-[18px] tracking-[-0.1px] text-[#969696]">
          © Copyright 2020 Pixsellz - Premium UI Goods for Designers
        </p>
        <div>
          {[...Array(3)].map((_, id) => (
            <span
              key={id}
              className="text-[13px] leading-[18px] tracking-[-0.1px] text-[#969696] ml-7"
            >
              Footer Link{id + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
