"use client";
import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { AuthLayout } from "@/layout/auth.layout.component";
import { useLogin } from "@/hooks/auth/useLogin.hooks";
import { loginSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { BlivapLogo } from "@/public/svg";

export default function LoginPage() {
  const { handleLogin, isLoading } = useLogin();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const slideBlocks = [
        "[data-login-logo]",
        "[data-login-intro]",
        "[data-login-social]",
      ];
      gsap.set(slideBlocks, { opacity: 0, y: 28 });
      gsap.set(["[data-login-field-row]", "[data-login-actions]"], {
        opacity: 0,
      });

      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            gsap.set(slideBlocks, { clearProps: "transform" });
          },
        })
        .fromTo(
          ["[data-login-logo]", "[data-login-intro]"],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.52, stagger: 0.07 },
          0,
        )
        .fromTo(
          "[data-login-field-row]",
          { opacity: 0 },
          { opacity: 1, duration: 0.36, stagger: 0.06 },
          "<0.08",
        )
        .fromTo(
          "[data-login-actions]",
          { opacity: 0 },
          { opacity: 1, duration: 0.34 },
          "<0.18",
        )
        .fromTo(
          "[data-login-social]",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.52 },
          "<0.1",
        );
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <AuthLayout>
      <div
        ref={rootRef}
        className="flex flex-col gap-12 mt-10 max-w-132 w-full"
      >
        <Link href="/" className="w-fit" data-login-logo>
          <p className="flex justify-center font-semibold font-helvetica text-primary text-5xl tracking-tight">
            <BlivapLogo fill="#960018" className="size-17" />
            <span className="-mt-1 -ml-4">livap</span>
          </p>
        </Link>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-px" data-login-intro>
            <p className="font-semibold text-2xl  text-[#100F14]">
              Welcome Back👋
            </p>
            <p className="text-sm text-[#49475A]">
              Kindly fill in your details below to login{" "}
            </p>
          </div>
          <div className="flex flex-col gap-7">
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({
                values,
                handleSubmit,
                errors,
                touched,
                handleChange,
                handleBlur,
                isValid,
                submitCount,
              }) => {
                const fieldError = (
                  name: keyof typeof values,
                ): string | undefined => {
                  const err = errors[name];
                  if (err == null || err === "") return undefined;
                  if (!touched[name] && submitCount === 0) return undefined;
                  if (Array.isArray(err)) return err.join(", ");
                  return String(err);
                };

                return (
                  <form
                    className="grid gap-6"
                    onSubmit={handleSubmit}
                    data-login-form
                  >
                    <div data-login-field-row>
                      <Input
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError("email")}
                        label="Email Address"
                        name="email"
                        placeholder="Email address"
                      />
                    </div>
                    <div data-login-field-row>
                      <Input
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError("password")}
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Password"
                      />
                    </div>

                    <div className="flex flex-col gap-4" data-login-actions>
                      <div className="flex justify-end">
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </div>
                  </form>
                );
              }}
            </Formik>
            <div
              className="flex flex-col items-center gap-8 "
              data-login-social
            >
              <p className="text-sm text-[#49475A]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary underline"
                >
                  Register
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
                  src="/icons/facebook.svg"
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
