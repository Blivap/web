"use client";

import { Input } from "@/app/components/inputs/input.component";
import { AuthLayout } from "@/app/components/layout/auth.layout.component";
import { useResetPassword } from "@/app/hooks/auth/useResetPassword.hook";
import { resetPasswordSchema } from "@/app/schema/auth.schema";
import { Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const { resetPassword, isLoading } = useResetPassword();
  const initialToken = useMemo(() => tokenFromUrl, [tokenFromUrl]);

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
              Reset password
            </p>
            <p className="text-base text-[#49475A]">
              Enter the token from your email and your new password.
            </p>
          </div>
          <Formik
            initialValues={{
              resetToken: initialToken,
              password: "",
            }}
            enableReinitialize
            validationSchema={resetPasswordSchema}
            onSubmit={(values) =>
              resetPassword({
                resetToken: values.resetToken,
                password: values.password,
              })
            }
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
                  value={values.resetToken}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.resetToken}
                  label="Reset token"
                  name="resetToken"
                  placeholder="Paste token from email"
                />
                <Input
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  label="New password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                />
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  {isLoading ? "Resetting..." : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex flex-col gap-15 max-w-132 w-full">
            <div className="h-12 bg-[#66666620] rounded w-32" />
            <div className="h-8 bg-[#66666620] rounded w-3/4" />
            <div className="h-10 bg-[#66666620] rounded w-full" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
