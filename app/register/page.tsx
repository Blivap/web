"use client";
import { Input } from "@/app/components/inputs/input.component";
import { AuthLayout } from "@/app/components/layout/auth.layout.component";
import { useRegister } from "@/app/hooks/auth/useRegister.hook";
import { registerSchema } from "@/app/schema/auth.schema";
import { Formik } from "formik";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  const { handleRegister, isLoading } = useRegister();
  return (
    <AuthLayout>
      <div className="flex flex-col gap-15 max-w-132 w-full">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Logo" width={45} height={45} />
          <p className="font-semibold text-[20px] text-[#19181F]">Blivap</p>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <p className="font-semibold text-2xl lg:text-[32px] text-[#100F14]">
              Welcome to Blivap👋
            </p>
            <p className="text-base text-[#49475A]">
              Kindly fill in your details below to create an account{" "}
            </p>
          </div>
          <div className="flex flex-col gap-7">
            <Formik
              initialValues={{
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
            >
              {({
                values,
                handleSubmit,
                errors,
                handleChange,
                handleBlur,
                isValid,
              }) => {
                return (
                  <form className="grid gap-6" onSubmit={handleSubmit}>
                    <Input
                      value={values.firstname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.firstname}
                      label="First Name"
                      name="firstname"
                      placeholder="Enter your firstname"
                    />
                    <Input
                      value={values.lastname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.lastname}
                      label="Last Name"
                      name="lastname"
                      placeholder="Enter your lastname"
                    />
                    <Input
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      label="Email Address"
                      name="email"
                      placeholder="Enter your email address"
                    />
                    <Input
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.password}
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                    />
                    <Input
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.confirmPassword}
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Enter your password"
                    />
                    <button
                      type="submit"
                      disabled={!isValid || isLoading}
                      className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                    >
                      Register
                    </button>
                  </form>
                );
              }}
            </Formik>
            <div className="flex flex-col items-center gap-8 ">
              <p className="text-base text-[#49475A]">
                Already have an account?{" "}
                <Link
                  href="login"
                  className="font-semibold text-primary underline"
                >
                  Login
                </Link>
              </p>
              <div className="flex items-center w-full max-w-99.75">
                <div className="w-full h-px bg-gray-300"></div>
                <p className="mx-4 text-gray-500">or</p>
                <div className="w-full h-px bg-gray-300"></div>
              </div>
              <div className="flex gap-6 items-center">
                <Image
                  src="/icons/Google.svg"
                  alt="Google"
                  width={32}
                  height={32}
                />
                <Image
                  src="/icons/Apple.svg"
                  alt="Apple"
                  width={32}
                  height={32}
                />
                <Image
                  src="/icons/Facebook.svg"
                  alt="Facebook"
                  width={32}
                  height={32}
                />
                <Image
                  src="/icons/twitter.svg"
                  alt="Twitter"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
