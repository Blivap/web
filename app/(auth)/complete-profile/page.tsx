"use client";

import { AuthLoader } from "@/components/auth/auth-loader.component";
import { Button } from "@/components/button/button.component";
import { DatePicker } from "@/components/forms/date-picker";
import { PhoneInput } from "@/components/forms/phone-input";
import { AuthLayout } from "@/layout/auth.layout.component";
import { useEditProfile } from "@/hooks/auth/useEditProfile.hook";
import { useLogout } from "@/hooks/auth/useLogout.hook";
import { hasRequiredProfileDetails } from "@/lib/auth/profileCompleteness";
import {
  getDnRedirect,
  getPostAuthRedirect,
} from "@/lib/navigation/authRedirect";
import { buildE164Phone, splitStoredPhone } from "@/lib/phone-country-codes";
import { completeProfileSchema } from "@/schema/auth.schema";
import { BlivapLogo } from "@/public/svg";
import { useAppSelector } from "@/store/hooks";
import { Formik } from "formik";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const head = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(head) ? head : "";
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dnRedirect = getDnRedirect(searchParams);
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { updateProfile, isLoading } = useEditProfile();
  const { handleLogout } = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (hasRequiredProfileDetails(user)) {
      router.replace(dnRedirect ?? getPostAuthRedirect(searchParams));
    }
  }, [dnRedirect, router, searchParams, user]);

  const initialValues = useMemo(() => {
    const phone = splitStoredPhone(user?.phonenumber);
    return {
      phoneCountryCode: phone.code,
      phoneNational: phone.national,
      dateOfBirth: toDateInputValue(user?.dateOfBirth),
    };
  }, [user?.phonenumber, user?.dateOfBirth]);

  if (!mounted || (token && !user)) {
    return <AuthLoader />;
  }

  if (!user) {
    return <AuthLoader />;
  }

  return (
    <AuthLayout>
      <div className="flex w-full max-w-132 flex-col gap-15">
        <Link href="/" className="mt-20 w-fit">
          <p className="flex justify-center font-semibold font-helvetica text-primary text-5xl tracking-tight">
            <BlivapLogo fill="#960018" className="size-17" />
            <span className="-mt-1 -ml-4">livap</span>
          </p>
        </Link>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <p className="text-2xl font-semibold text-[#100F14] dark:text-white lg:text-[32px]">
              Finish your profile
            </p>
            <p className="text-base text-[#49475A] dark:text-slate-400">
              Add your phone number and date of birth so we can keep your
              account secure and ready for donations.
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={completeProfileSchema}
            onSubmit={async (values) => {
              const nationalDigits = values.phoneNational.replace(/\D/g, "");
              const updated = await updateProfile({
                phonenumber: buildE164Phone(
                  values.phoneCountryCode,
                  nationalDigits,
                ),
                dateOfBirth: values.dateOfBirth || null,
              });
              if (!updated) return;
              router.replace(dnRedirect ?? getPostAuthRedirect(searchParams));
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              isValid,
            }) => (
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <DatePicker
                  name="dateOfBirth"
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.dateOfBirth && errors.dateOfBirth}
                  label="Date of birth"
                  placeholder="DD-MM-YYYY"
                  max={new Date().toISOString().slice(0, 10)}
                />
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
                  storedFullPhone={user.phonenumber}
                  errorNational={touched.phoneNational && errors.phoneNational}
                  errorCountryCode={
                    touched.phoneCountryCode && errors.phoneCountryCode
                  }
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || isLoading}
                  loading={isLoading}
                >
                  {isLoading ? "Saving..." : "Continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit gap-2 text-base text-[#49475A] dark:text-slate-300"
                  onClick={() => void handleLogout()}
                >
                  <LogOut size={16} aria-hidden />
                  Logout
                </Button>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </AuthLayout>
  );
}
