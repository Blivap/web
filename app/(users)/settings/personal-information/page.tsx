"use client";

import { DatePicker } from "@/components/forms/date-picker";
import { Input } from "@/components/forms/inputs/input.component";
import { PhoneInput } from "@/components/forms/phone-input";
import { useSettings } from "@/hooks/settings/useSettings.hook";
import { editProfileSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import { useEffect, useMemo, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { useAvatarModal } from "@/hooks/select-avatar/useAvatarModal.hook";
import { FaPencilAlt } from "react-icons/fa";
import { Button } from "@/components/button/button.component";
import { buildE164Phone, splitStoredPhone } from "@/lib/phone-country-codes";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedAvatar } from "@/store/slices/selectAvatarSlice";
import { SettingsShell } from "../components/settings-shell";
import { SettingsCard } from "../components/settings-card";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const head = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(head) ? head : "";
}

export default function PersonalInformationPage() {
  const dispatch = useAppDispatch();
  const { user, updateProfile, isProfileLoading } = useSettings();
  const { open: openAvatarModal } = useAvatarModal();
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
    <SettingsShell
      title="Personal Information"
      description="Update your profile details and photo."
    >
      <SettingsCard>
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
                  <p className="text-sm font-medium text-[#111827] dark:text-white/90">
                    Your Profile Picture
                  </p>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="relative">
                      <Avatar
                        src={values.profileImage || user?.profileImage}
                        className="size-20 sm:size-34 border-[3px] border-primary"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        className="absolute right-3 bottom-3 translate-x-1/4 translate-y-1/4 size-7 p-2 rounded-full bg-black text-white border-2 border-white shadow-md hover:bg-black/90"
                        aria-label="Change profile picture"
                        onClick={() => {
                          dispatch(
                            setSelectedAvatar(
                              values.profileImage ||
                                user?.profileImage ||
                                null,
                            ),
                          );
                          openAvatarModal();
                        }}
                      >
                        <FaPencilAlt size={12} className="size-3 " />
                      </Button>
                    </div>
                  </div>
                </div>

                <hr className="border-t border-[#E5E7EB] dark:border-white/10" />

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
                        inputClassName="py-1.5 "
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
                        inputClassName="py-1.5 "
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
                      inputClassName="py-1.5"
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
                      inputClassName="py-1.5 bg-[#F9FAFB] dark:bg-white/5"
                      containerClassName="gap-1"
                    />
                    <p className="text-[10px] text-[#6B7280] dark:text-white/50">
                      Email cannot be changed here.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-md px-5 text-xs font-semibold"
                    disabled={isProfileLoading}
                    loading={isProfileLoading}
                  >
                    {isProfileLoading ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            );
          }}
        </Formik>
      </SettingsCard>
    </SettingsShell>
  );
}
