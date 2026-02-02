"use client";

import { Input } from "@/app/components/inputs/input.component";
import { AuthLayout } from "@/app/components/layout/auth.layout.component";
import { useForgotPassword } from "@/app/hooks/auth/useForgotPassword.hook";
import { forgotPasswordSchema } from "@/app/schema/auth.schema";
import { Formik } from "formik";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useForgotPassword();

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
              Forgot password
            </p>
            <p className="text-base text-[#49475A]">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={forgotPasswordSchema}
            onSubmit={(values) => forgotPassword({ email: values.email })}
          >
            {({
              values,
              handleSubmit,
              errors,
              handleChange,
              handleBlur,
              isValid,
            }) => (
              <form className="grid gap-6" onSubmit={handleSubmit}>
                <Input
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  label="Email Address"
                  name="email"
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}
          </Formik>
          <p className="text-base text-[#49475A]">
            <Link href="/login" className="font-semibold text-primary underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
