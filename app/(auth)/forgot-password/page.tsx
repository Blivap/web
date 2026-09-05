"use client";

import { Input } from "@/components/forms/inputs/input.component";
import { AuthLayout } from "@/layout/auth.layout.component";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword.hook";
import { forgotPasswordSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import Link from "next/link";
import { BlivapLogo } from "@/public/svg";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useForgotPassword();

  return (
    <AuthLayout>
      <div className="flex w-full max-w-132 flex-col gap-6">
        <Link href="/" className="w-fit" data-login-logo>
          <p className="flex justify-center font-semibold font-helvetica text-primary text-5xl tracking-tight">
            <BlivapLogo fill="#960018" className="size-17" />
            <span className="-mt-1 -ml-4">livap</span>
          </p>
        </Link>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <p className="text-2xl font-semibold text-[#100F14] dark:text-white lg:text-[32px]">
              Forgot password
            </p>
            <p className="text-base text-[#49475A] dark:text-slate-400">
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
                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  loading={isLoading}
                  className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  Send
                </Button>
              </form>
            )}
          </Formik>
          <p className="text-base text-[#49475A] dark:text-slate-400">
            <Link
              href="/login"
              className="font-semibold text-primary underline"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
