"use client";

import Link from "next/link";
import { Formik } from "formik";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/forms/inputs/input.component";
import { Button } from "@/components/button/button.component";
import { useChangePassword } from "@/hooks/auth/useChangePassword.hook";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword.hook";
import { useSettings } from "@/hooks/settings/useSettings.hook";
import { changePasswordSchema } from "@/schema/auth.schema";
import { routes } from "@/config/routes";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";
import { SettingsToggleRow } from "../components/settings-toggle-row";

export default function PrivacySecurityPage() {
  const { user } = useSettings();
  const { changePassword, isLoading } = useChangePassword();
  const { forgotPassword, isLoading: isPasswordResetRequesting } =
    useForgotPassword();
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <SettingsShell
      title="Privacy & Security"
      description="Manage your password and account security preferences."
    >
      <SettingsCard>
        <Formik
          initialValues={{
            oldPassword: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={changePasswordSchema}
          onSubmit={async (values, { resetForm }) => {
            const ok = await changePassword({
              oldPassword: values.oldPassword,
              password: values.password,
            });
            if (ok) resetForm();
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            dirty,
            isValid,
          }) => (
            <form
              className="flex flex-col gap-4 max-w-md"
              onSubmit={handleSubmit}
              noValidate
            >
              <SettingsSectionLabel title="Change Password" />
              <Input
                name="oldPassword"
                type="password"
                label="Current Password"
                placeholder="Current password"
                value={values.oldPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.oldPassword && errors.oldPassword}
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />
              <Input
                name="password"
                type="password"
                label="New Password"
                placeholder="New password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />
              <Input
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && errors.confirmPassword}
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-md px-5 text-xs font-semibold"
                  disabled={isLoading || !dirty || !isValid}
                  loading={isLoading}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-md px-4 text-xs font-semibold"
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
            </form>
          )}
        </Formik>
      </SettingsCard>

      <SettingsCard className="flex flex-col gap-3">
        <SettingsSectionLabel title="Security Preferences" />
        <div className="rounded-xl border border-[#E5E7EB] dark:border-white/10">
          <SettingsToggleRow
            title="Two-Factor Authentication"
            description="Extra verification when signing in (coming soon)"
            value={twoFactor}
            onValueChange={setTwoFactor}
            showDivider={false}
          />
        </div>
      </SettingsCard>

      <SettingsCard className="flex flex-col gap-3">
        <SettingsSectionLabel title="Danger Zone" />
        <Link
          href={routes.settingsDeleteAccount}
          className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-[#FFF5F5] px-4 py-4 transition-colors hover:bg-[#FFECEC] dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/15"
        >
          <span className="text-sm font-semibold text-primary">
            Delete Account
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-primary shadow-sm dark:bg-white/10">
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </Link>
      </SettingsCard>
    </SettingsShell>
  );
}
