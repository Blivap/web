"use client";

import { Input } from "@/components/forms/inputs/input.component";
import { AuthLayout } from "@/layout/auth.layout.component";
import { useResetPassword } from "@/hooks/auth/useResetPassword.hook";
import { resetPasswordSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") ?? "";
  const { resetPassword, isLoading } = useResetPassword();
  const hasValidLink = Boolean(resetToken);

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
              Choose a new password for your account. Use the link from your
              email; the reset token is applied automatically.
            </p>
          </div>
          {!hasValidLink && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              This link is missing a valid reset token. Open the reset link from
              your email, or{" "}
              <Link
                href="/forgot-password"
                className="font-semibold text-primary underline"
              >
                request a new one
              </Link>
              .
            </p>
          )}
          <Formik
            initialValues={{
              password: "",
            }}
            validationSchema={resetPasswordSchema}
            onSubmit={(values) => {
              if (!resetToken) return;
              void resetPassword({
                resetToken,
                password: values.password,
              });
            }}
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
                  disabled={!isValid || isLoading || !hasValidLink}
                  className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  {isLoading ? "Resetting..." : "Reset password"}
                </button>
              </form>
            )}
          </Formik>
          <p className="text-base text-[#49475A]">
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
