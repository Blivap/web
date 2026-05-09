"use client";
import { Button } from "@/components/button/button.component";
import { Checkbox } from "@/components/forms/checkbox";
import { DatePicker } from "@/components/forms/date-picker";
import { Input } from "@/components/forms/inputs/input.component";
import { PhoneInput } from "@/components/forms/phone-input";
import { AuthLayout } from "@/layout/auth.layout.component";
import { routes } from "@/config/routes";
import { useRegister } from "@/hooks/auth/useRegister.hook";
import { registerSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { BlivapLogo } from "@/public/svg";

export default function SignUpPage() {
  const { handleRegister, isLoading } = useRegister();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const slideBlocks = [
        "[data-register-logo]",
        "[data-register-intro]",
        "[data-register-social]",
      ];
      gsap.set(slideBlocks, { opacity: 0, y: 28 });
      gsap.set(["[data-register-field-row]", "[data-register-actions]"], {
        opacity: 0,
      });

      // Do not animate `y` on `[data-register-form]` or field rows — GSAP leaves
      // `transform` on those ancestors and traps date/phone popovers under later inputs.
      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            gsap.set(slideBlocks, { clearProps: "transform" });
          },
        })
        .fromTo(
          ["[data-register-logo]", "[data-register-intro]"],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.52, stagger: 0.07 },
          0,
        )
        .fromTo(
          "[data-register-field-row]",
          { opacity: 0 },
          { opacity: 1, duration: 0.36, stagger: 0.04 },
          "<0.08",
        )
        .fromTo(
          "[data-register-actions]",
          { opacity: 0 },
          { opacity: 1, duration: 0.34 },
          "<0.18",
        )
        .fromTo(
          "[data-register-social]",
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
        <Link href="/" className="w-fit" data-register-logo>
          <p className="flex justify-center font-semibold font-helvetica text-primary text-5xl tracking-tight">
            <BlivapLogo fill="#960018" className="size-17" />
            <span className="-mt-1 -ml-4">livap</span>
          </p>
        </Link>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2" data-register-intro>
            <p className="font-semibold text-2xl  text-[#100F14]">
              Welcome to Blivap👋
            </p>
            <p className="text-sm text-[#49475A]">
              Kindly fill in your details below to create an account{" "}
            </p>
          </div>
          <div className="flex flex-col gap-7">
            <Formik
              initialValues={{
                firstname: "",
                lastname: "",
                dateOfBirth: "",
                email: "",
                phoneCountryCode: "+234",
                phoneNational: "",
                password: "",
                confirmPassword: "",
                termsAndCondition: false,
                privacyStatement: false,
              }}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
            >
              {({
                values,
                handleSubmit,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                isValid,
                submitCount,
              }) => {
                return (
                  <form
                    className="grid gap-6"
                    onSubmit={handleSubmit}
                    data-register-form
                  >
                    <div
                      className="grid grid-cols-2 gap-4 md:gap-6"
                      data-register-field-row
                    >
                      <Input
                        value={values.firstname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.firstname && errors.firstname}
                        label="First Name"
                        name="firstname"
                        placeholder="First name"
                      />
                      <Input
                        value={values.lastname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.lastname && errors.lastname}
                        label="Last Name"
                        name="lastname"
                        placeholder="Last name"
                      />
                    </div>
                    <div
                      className="grid grid-cols-2 gap-4 md:gap-6"
                      data-register-field-row
                    >
                      <div className="min-w-0">
                        <DatePicker
                          value={values.dateOfBirth}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.dateOfBirth && errors.dateOfBirth}
                          label="Date Of Birth"
                          name="dateOfBirth"
                          placeholder="DD-MM-YYYY"
                          max={new Date().toISOString().slice(0, 10)}
                        />
                      </div>
                      <div className="min-w-0">
                        <PhoneInput
                          label="Phone number"
                          countryCodeName="phoneCountryCode"
                          nationalFieldName="phoneNational"
                          countryCode={values.phoneCountryCode}
                          national={values.phoneNational}
                          onCountryCodeChange={handleChange}
                          onNationalDigitsChange={(digits) => {
                            void setFieldValue("phoneNational", digits);
                          }}
                          onBlur={handleBlur}
                          errorNational={
                            touched.phoneNational && errors.phoneNational
                          }
                          errorCountryCode={
                            touched.phoneCountryCode && errors.phoneCountryCode
                          }
                        />
                      </div>
                    </div>
                    <div data-register-field-row>
                      <Input
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && errors.email}
                        label="Email Address"
                        name="email"
                        placeholder="Email address"
                      />
                    </div>
                    <div data-register-field-row>
                      <Input
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && errors.password}
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                      />
                    </div>
                    <div data-register-field-row>
                      <Input
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.confirmPassword && errors.confirmPassword
                        }
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Password"
                      />
                    </div>
                    <div className="flex flex-col gap-4" data-register-actions>
                      <div className="flex flex-col gap-2">
                        <Checkbox
                          label={
                            <p className="text-[#333333]">
                              I agree to the{" "}
                              <Link
                                href={routes.terms}
                                className="underline text-primary hover:text-primary/80 transition-colors"
                              >
                                terms and conditions
                              </Link>
                            </p>
                          }
                          name="termsAndCondition"
                          value={values.termsAndCondition}
                          onChange={(checked) => {
                            void setFieldValue("termsAndCondition", checked);
                          }}
                          onBlur={handleBlur}
                        />

                        <Checkbox
                          label={
                            <p className="text-[#333333]">
                              I agree to the{" "}
                              <Link
                                href={routes.privacy}
                                className="underline text-primary hover:text-primary/80 transition-colors"
                              >
                                privacy statement
                              </Link>
                            </p>
                          }
                          name="privacyStatement"
                          value={values.privacyStatement}
                          onChange={(checked) => {
                            void setFieldValue("privacyStatement", checked);
                          }}
                          onBlur={handleBlur}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className="w-full disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                      >
                        Register
                      </Button>
                    </div>
                  </form>
                );
              }}
            </Formik>
            <div
              className="flex flex-col items-center gap-8"
              data-register-social
            >
              <p className="text-sm text-[#49475A]">
                Already have an account?{" "}
                <Link
                  href="/login"
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
