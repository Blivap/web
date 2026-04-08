"use client";

import { DatePicker } from "@/components/forms/date-picker";
import { Input } from "@/components/forms/inputs/input.component";
import { PhoneInput } from "@/components/forms/phone-input";
import { useSettings } from "@/hooks/settings/useSettings.hook";
import { editProfileSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import { useEffect, useMemo, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { useSelectAvatar } from "@/hooks/select-avatar/useSelectAvatar.hook";
import { useAvatarModal } from "@/hooks/select-avatar/useAvatarModal.hook";
import { FaPencilAlt } from "react-icons/fa";
import { Button } from "@/components/button/button.component";
import { Layout } from "@/layout/layout.component";
import { buildE164Phone, splitStoredPhone } from "@/lib/phone-country-codes";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const head = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(head) ? head : "";
}

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    forgotPassword,
    isProfileLoading,
    isPasswordResetRequesting,
  } = useSettings();
  const {
    avatars,
    handleSelectAvatar,
    getAvatars,
  } = useSelectAvatar();
  const { open: openAvatarModal } = useAvatarModal();
  useEffect(() => {
    if (!avatars) {
      void getAvatars();
    }
  }, [avatars, getAvatars]);
  const setProfileImageRef = useRef<(field: string, value: string) => void>(
    () => {},
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setProfileImageRef.current("profileImage", custom.detail ?? "");
    };
    window.addEventListener("blivap:set-avatar", handler);
    return () => window.removeEventListener("blivap:set-avatar", handler);
  }, []);

  const profileInitialValues = useMemo(() => {
    const phone = splitStoredPhone(user?.phonenumber);
    return {
      firstname: user?.firstname ?? "",
      lastname: user?.lastname ?? "",
      email: user?.email ?? "",
      phoneCountryCode: phone.code,
      phoneNational: phone.national,
      dateOfBirth: toDateInputValue(user?.dateOfBirth),
      profileImage: user?.profileImage ?? "",
    };
  }, [
    user?.firstname,
    user?.lastname,
    user?.email,
    user?.phonenumber,
    user?.dateOfBirth,
    user?.profileImage,
  ]);

  return (
    <Layout>
      <div className="flex flex-col gap-6 md:gap-8">
        <section className="rounded-xl border border-[#DADADA] bg-white px-4 py-5 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7 md:rounded-2xl md:px-10 md:py-8 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <header className="flex flex-col w-fit mb-6 sm:mb-7">
            <h1 className="text-xl sm:text-2xl font-semibold text-primary">
              Account Setting
            </h1>
            <div className="mt-1 h-[2px] w-full bg-primary rounded-full" />
          </header>

          <Formik
            initialValues={profileInitialValues}
            enableReinitialize
            validationSchema={editProfileSchema}
            onSubmit={(values) => {
              const nationalDigits = values.phoneNational.replace(/\D/g, "");
              return updateProfile({
                firstname: values.firstname.trim(),
                lastname: values.lastname.trim(),
                phonenumber:
                  nationalDigits.length > 0
                    ? buildE164Phone(values.phoneCountryCode, nationalDigits)
                    : null,
                dateOfBirth: values.dateOfBirth || null,
                profileImage: values.profileImage?.trim()
                  ? values.profileImage.trim()
                  : null,
              });
            }}
          >
            {({
              values,
              handleSubmit,
              errors,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => {
              setProfileImageRef.current = setFieldValue;

              return (
                <form
                  className="flex flex-col gap-8"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-medium text-[#111827]">
                      Your Profile Picture
                    </p>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="relative">
                        <Avatar
                          src={values.profileImage || user?.profileImage}
                          className="size-20 sm:size-34 border-[3px] border-primary"
                        />
                        <button
                          type="button"
                          className="absolute right-3 bottom-3 translate-x-1/4 translate-y-1/4 flex items-center justify-center size-7 rounded-full bg-black text-white border-2 border-white shadow-md"
                          aria-label="Change profile picture"
                          onClick={() => {
                            handleSelectAvatar(
                              values.profileImage || user?.profileImage || "",
                            );
                            openAvatarModal();
                          }}
                        >
                          <FaPencilAlt size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-[#E5E7EB]" />

                  <div className="max-w-md flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-[#111827] dark:text-white/90">
                          First name
                        </label>
                        <Input
                          value={values.firstname}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.firstname}
                          name="firstname"
                          placeholder="First name"
                          label={undefined}
                          labelClassName="text-[11px]"
                          inputClassName="py-1.5 text-xs"
                          containerClassName="gap-1"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-[#111827] dark:text-white/90">
                          Last name
                        </label>
                        <Input
                          value={values.lastname}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.lastname}
                          name="lastname"
                          placeholder="Last name"
                          label={undefined}
                          labelClassName="text-[11px]"
                          inputClassName="py-1.5 text-xs"
                          containerClassName="gap-1"
                        />
                      </div>
                    </div>

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
                      storedFullPhone={user?.phonenumber}
                      errorNational={errors.phoneNational}
                      errorCountryCode={errors.phoneCountryCode}
                      selectClassName="max-w-[min(20%,12rem)]"
                    />

                    <div className="flex flex-col gap-1">
                      <DatePicker
                        name="dateOfBirth"
                        value={values.dateOfBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.dateOfBirth}
                        label="Date of birth"
                        labelClassName="text-[11px] font-medium text-[#111827] dark:text-white/90"
                        inputClassName="py-1.5 text-xs"
                        containerClassName="gap-1"
                        placeholder="DD-MM-YYYY"
                        max={new Date().toISOString().slice(0, 10)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#111827] dark:text-white/90">
                        Email
                      </label>
                      <Input
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        name="email"
                        placeholder="you@example.com"
                        readOnly
                        aria-readonly="true"
                        label={undefined}
                        labelClassName="text-[11px]"
                        inputClassName="py-1.5 text-xs bg-[#F9FAFB] dark:bg-white/5"
                        containerClassName="gap-1"
                      />
                      <p className="text-[10px] text-[#6B7280] dark:text-white/50">
                        Email cannot be changed here.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProfileLoading}
                      className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProfileLoading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </section>

        <section className="rounded-xl border border-[#DADADA] bg-white px-4 py-5 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7 md:rounded-2xl md:px-10 md:py-8 max-w-xl dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <h2 className="font-semibold text-lg text-[#100F14] dark:text-white/90">
            Password
          </h2>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-white/55">
            We&apos;ll email you a link to set a new password. For security,
            passwords cannot be viewed or edited on this page.
          </p>
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-md! px-5 py-2.5 text-sm font-semibold"
              disabled={!user?.email || isPasswordResetRequesting}
              loading={isPasswordResetRequesting}
              onClick={() => {
                if (!user?.email) return;
                void forgotPassword(
                  { email: user.email },
                  { redirectOnSuccess: false },
                );
              }}
            >
              Email me a reset link
            </Button>
          </div>
        </section>
      </div>

    </Layout>
  );
}
