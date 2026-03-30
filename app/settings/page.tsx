"use client";

import { Input } from "@/components/forms/inputs/input.component";
import { useSettings } from "@/hooks/settings/useSettings.hook";
import { editProfileSchema, changePasswordSchema } from "@/schema/auth.schema";
import { Formik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { useSelectAvatar } from "@/hooks/select-avatar/useSelectAvatar.hook";
import { FaPencilAlt } from "react-icons/fa";
import Image from "next/image";
import classNames from "classnames";
import { Button } from "@/components/button/button.component";
import { Layout } from "@/layout/layout.component";

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    changePassword,
    isProfileLoading,
    isPasswordLoading,
  } = useSettings();
  const {
    avatars,
    isLoading,
    selectedAvatar,
    handleSelectAvatar,
    getAvatars,
    handleContinue,
    isConfirming,
  } = useSelectAvatar();
  useEffect(() => {
    if (!avatars) {
      void getAvatars();
    }
  }, [avatars, getAvatars]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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

  const profileInitialValues = useMemo(
    () => ({
      firstname: user?.firstname ?? "",
      lastname: user?.lastname ?? "",
      email: user?.email ?? "",
      profileImage: user?.profileImage ?? "",
    }),
    [user?.firstname, user?.lastname, user?.phonenumber, user?.profileImage],
  );

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
            onSubmit={(values) =>
              updateProfile({
                firstname: values.firstname || undefined,
                lastname: values.lastname || undefined,
                profileImage: values.profileImage || null,
              })
            }
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
                            setIsAvatarModalOpen(true);
                          }}
                        >
                          <FaPencilAlt size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-[#E5E7EB]" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#111827]">
                        Email
                      </label>
                      <Input
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        name="email"
                        placeholder="you@example.com"
                        label={undefined}
                        labelClassName="text-[11px]"
                        inputClassName="py-1.5 text-xs"
                        containerClassName="gap-1"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#111827]">
                        Password
                      </label>
                      <Input
                        value={""}
                        onChange={() => {}}
                        name="password"
                        type="password"
                        placeholder="••••••••••"
                        disabled
                        label={undefined}
                        labelClassName="text-[11px]"
                        inputClassName="py-1.5 text-xs"
                        containerClassName="gap-1"
                      />
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

        <section className="flex flex-col gap-6 max-w-xl">
          <h2 className="font-semibold text-lg text-[#100F14]">
            Change password
          </h2>
          <Formik
            initialValues={{
              oldPassword: "",
              password: "",
            }}
            validationSchema={changePasswordSchema}
            onSubmit={(values) =>
              changePassword({
                oldPassword: values.oldPassword,
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
              <form
                className="flex flex-col gap-6"
                onSubmit={handleSubmit}
                noValidate
              >
                <Input
                  value={values.oldPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.oldPassword}
                  label="Current password"
                  name="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  labelClassName="text-[11px]"
                  inputClassName="py-1.5 text-xs"
                  containerClassName="gap-1"
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
                  labelClassName="text-[11px]"
                  inputClassName="py-1.5 text-xs"
                  containerClassName="gap-1"
                />
                <button
                  type="submit"
                  disabled={!isValid || isPasswordLoading}
                  className="w-fit disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-2 px-5 rounded-md font-semibold text-xs hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  {isPasswordLoading ? "Updating..." : "Change password"}
                </button>
              </form>
            )}
          </Formik>
        </section>
      </div>
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="flex w-[90%] max-w-md flex-col gap-6 rounded-2xl bg-white px-6 py-7 shadow-xl sm:max-w-lg sm:px-8 dark:bg-[#1a1a22] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg sm:text-xl font-semibold text-primary text-center mb-5">
              Select Avatar
            </h2>
            <div className="grid grid-cols-4 grid-rows-3 gap-4 rounded-3xl bg-[#00000026] px-5 py-10 md:px-[75px] md:py-[98px]">
              {isLoading || !avatars
                ? [...Array(12)].map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center size-[60px] shrink-0 animate-pulse rounded-full border border-[#FFFFFF00] bg-[#B190B6] "
                    />
                  ))
                : avatars?.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={classNames(
                        "relative size-[60px] shrink-0 overflow-hidden rounded-full border border-[#FFFFFF00] bg-[#B190B6] transition-all duration-150 hover:border-3 hover:border-primary",
                        {
                          "border-3 border-primary":
                            selectedAvatar === avatar.url,
                        },
                      )}
                      onClick={() => handleSelectAvatar(avatar.url)}
                    >
                      <Image
                        src={avatar.url}
                        alt="Avatar option"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-[#14141a] dark:text-white/85 dark:hover:bg-white/[0.06]"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Cancel
              </button>
              <Button
                disabled={!selectedAvatar || isConfirming}
                loading={isConfirming}
                onClick={() => {
                  void handleContinue(false);
                  setIsAvatarModalOpen(false);
                }}
                className="rounded-md! px-5 py-2"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
