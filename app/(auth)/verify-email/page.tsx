"use client";

import { AuthLoader } from "@/components/auth/auth-loader.component";
import { Input } from "@/components/forms/inputs/input.component";
import { AuthLayout } from "@/layout/auth.layout.component";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail.hook";
import { useResendVerificationLink } from "@/hooks/auth/useResendVerificationLink.hook";
import { getPostAuthRedirect } from "@/lib/navigation/authRedirect";
import { verifyEmailSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { useLogout } from "@/hooks/auth/useLogout.hook";
import { LogOut } from "lucide-react";
import { BlivapLogo } from "@/public/svg";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { verifyEmail, isLoading } = useVerifyEmail();
  const { resendLink, isLoading: isResending } = useResendVerificationLink();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const { handleLogout } = useLogout();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (user?.emailVerified === true) {
      router.replace(getPostAuthRedirect(searchParams));
    }
  }, [user?.emailVerified, router, searchParams]);

  const cookieToken =
    mounted && typeof window !== "undefined"
      ? Cookies.get("auth_token")
      : undefined;
  const hasSession = Boolean(token || cookieToken);
  const awaitingUserProfile = hasSession && user === null;

  if (!mounted || awaitingUserProfile) {
    return <AuthLoader />;
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-15 max-w-132 w-full">
        <Link href="/" className="w-fit mt-20">
          <p className="flex justify-center font-semibold font-helvetica text-primary text-5xl tracking-tight">
            <BlivapLogo fill="#960018" className="size-17" />
            <span className="-mt-1 -ml-4">livap</span>
          </p>
        </Link>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <p className="font-semibold text-2xl lg:text-[32px] text-[#100F14]">
              Verify your email
            </p>
            <p className="text-base text-[#49475A]">
              Enter the token from your verification email and your email
              address.
            </p>
          </div>
          <Formik
            initialValues={{
              emailValidationToken: "",
            }}
            validationSchema={verifyEmailSchema}
            onSubmit={(values) =>
              verifyEmail({
                email: user?.email ?? "",
                emailValidationToken: values.emailValidationToken,
              })
            }
          >
            {({
              values,
              handleSubmit,
              errors,
              touched,
              handleChange,
              handleBlur,
              isValid,
            }) => (
              <div className="flex flex-col gap-6">
                <form className="grid gap-6" onSubmit={handleSubmit}>
                  <Input
                    value={values.emailValidationToken}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.emailValidationToken &&
                      errors.emailValidationToken
                    }
                    label="Verification token"
                    name="emailValidationToken"
                    placeholder="Paste token from email"
                  />
                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                  >
                    {isLoading ? "Verifying..." : "Verify email"}
                  </button>
                </form>
                <p className="text-base text-[#49475A]">
                  Didn&apos;t receive the email?{" "}
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={() =>
                      values.emailValidationToken
                        ? resendLink({ email: user?.email ?? "" })
                        : undefined
                    }
                    className="font-semibold text-primary underline disabled:opacity-50 cursor-pointer"
                  >
                    {isResending ? "Sending..." : "Resend"}
                  </button>
                </p>
                <button
                  className="border border-primary rounded-md py-2 px-4 hover:bg-primary/5 active:bg-transparent transition-colors duration-200 w-fit flex items-center gap-2 text-base text-[#49475A] cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </Formik>
        </div>
      </div>
    </AuthLayout>
  );
}
