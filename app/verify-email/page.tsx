"use client";

import { Input } from "@/app/components/inputs/input.component";
import { AuthLayout } from "@/app/components/layout/auth.layout.component";
import { useVerifyEmail } from "@/app/hooks/auth/useVerifyEmail.hook";
import { useResendVerificationLink } from "@/app/hooks/auth/useResendVerificationLink.hook";
import { verifyEmailSchema } from "@/app/schema/auth.schema";
import { Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "../store/hooks";
import { useLogout } from "../hooks/auth/useLogout.hook";
import { LogOut } from "lucide-react";

export default function VerifyEmailPage() {
  const { verifyEmail, isLoading } = useVerifyEmail();
  const { resendLink, isLoading: isResending } =
    useResendVerificationLink();
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
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
                    error={errors.emailValidationToken}
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
                    disabled={isResending }
                    onClick={() =>
                      values.emailValidationToken
                        ? resendLink({ email: user?.email ?? "" })
                        : undefined
                    }
                    className="font-semibold text-primary underline disabled:opacity-50 cursor-pointer"
                  >
                    {isResending ? "Sending..." : "Resend verification link"}
                  </button>
                </p>
                <button className="border border-primary rounded-md py-2 px-4 hover:bg-primary/5 active:bg-transparent transition-colors duration-200 w-fit flex items-center gap-2 text-base text-[#49475A] cursor-pointer" onClick={handleLogout}>
                 <LogOut size={16}/>
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
