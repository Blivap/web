"use client";

import { Layout } from "@/app/components/layout/layout.component";
import { Input } from "@/app/components/inputs/input.component";
import { useSettings } from "@/app/hooks/settings/useSettings.hook";
import {
  editProfileSchema,
  changePasswordSchema,
} from "@/app/schema/auth.schema";
import { Formik } from "formik";
import { useMemo } from "react";

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    changePassword,
    isProfileLoading,
    isPasswordLoading,
  } = useSettings();

  const profileInitialValues = useMemo(
    () => ({
      firstname: user?.firstname ?? "",
      lastname: user?.lastname ?? "",
      phonenumber: user?.phonenumber ?? "",
      profileImage: user?.profileImage ?? "",
    }),
    [user?.firstname, user?.lastname, user?.phonenumber, user?.profileImage],
  );

  return (
    <Layout>
      <div className="flex flex-col gap-10 max-w-2xl">
        <h1 className="font-bold text-2xl text-[#100F14]">Settings</h1>

        <section className="flex flex-col gap-6">
          <h2 className="font-semibold text-xl text-[#100F14]">
            Edit profile
          </h2>
          <Formik
            initialValues={profileInitialValues}
            enableReinitialize
            validationSchema={editProfileSchema}
            onSubmit={(values) =>
              updateProfile({
                firstname: values.firstname || undefined,
                lastname: values.lastname || undefined,
                phonenumber: values.phonenumber || null,
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
            }) => (
              <form
                className="flex flex-col gap-6"
                onSubmit={handleSubmit}
                noValidate
              >
                <Input
                  value={values.firstname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.firstname}
                  label="First name"
                  name="firstname"
                  placeholder="First name"
                />
                <Input
                  value={values.lastname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.lastname}
                  label="Last name"
                  name="lastname"
                  placeholder="Last name"
                />
                <Input
                  value={values.phonenumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phonenumber}
                  label="Phone number"
                  name="phonenumber"
                  placeholder="+234..."
                />
                <Input
                  value={values.profileImage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.profileImage}
                  label="Profile image URL"
                  name="profileImage"
                  placeholder="https://..."
                />
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="w-fit disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] px-6 rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  {isProfileLoading ? "Saving..." : "Save profile"}
                </button>
              </form>
            )}
          </Formik>
        </section>

        <section className="flex flex-col gap-6 border-t border-[#66666659] pt-8">
          <h2 className="font-semibold text-xl text-[#100F14]">
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
                  disabled={!isValid || isPasswordLoading}
                  className="w-fit disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary text-white py-[12.5px] px-6 rounded-lg font-semibold text-base hover:bg-primary/85 active:bg-primary transition duration-200"
                >
                  {isPasswordLoading ? "Updating..." : "Change password"}
                </button>
              </form>
            )}
          </Formik>
        </section>
      </div>
    </Layout>
  );
}
