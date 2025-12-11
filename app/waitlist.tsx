import Image from "next/image";

export const WaitList = () => {
  return (
    <div className="p-5 max-w-[1277px]">
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
            Are you Ready for a revolution in the <br/><span className="font-bold">Medical industry?</span> <span className="text-primary">Explore us</span> 
          </p>
          <p className="mt-[60px] text-base leading-[27px] text-text-tertiary">
            Blood and sperm donors – use our platform and donor ID cards to
            manage your appointments, track your donation history in real time,
            and eliminate confusion or delays in the donation process.
          </p>
        </div>
        <div className="mt-6 md:mt-[187px] flex border border-border rounded-[40px] w-full">

          <form className="flex w-full gap-4 ml-7" action="">
<Image src='/icons/outline-email.svg' alt="icon" width={32} height={32}/>
          <input className="w-full outline-none" type="text" placeholder="Your email address" name="" id="" />
        <button type="submit" className="bg-primary text-text-inverse text-base leading-[27px] rounded-[40px] px-[32px] py-[22px] text-nowrap">Get Early Access</button>
          </form>
        </div>
        </div>
        <div className="flex md:justify-end">
          
          <div className="flex justify-center items-center bg-primary w-[356px] h-[533px] rounded-[70px] mt-auto" >
            <div className="relative w-[282px] h-[587px] -mt-[130px]">

            <Image src='/images/sample.png' alt="blivap mobile" fill/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
