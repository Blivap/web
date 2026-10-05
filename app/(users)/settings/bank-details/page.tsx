"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Formik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/forms/inputs/input.component";
import { Button } from "@/components/button/button.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";
import { SettingsToggleRow } from "../components/settings-toggle-row";

const bankDetailsSchema = yup.object({
  accountHolder: yup.string().trim().required("Account holder name is required"),
  bankName: yup.string().trim().required("Bank name is required"),
  accountNumber: yup
    .string()
    .trim()
    .matches(/^\d{8,20}$/, "Enter 8–20 digits")
    .required("Account number is required"),
  isPrimary: yup.boolean().default(true),
});

export default function BankDetailsPage() {
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  return (
    <SettingsShell
      title="Bank Details"
      description="Manage the account used for donation reimbursements."
    >
      <SettingsCard className="flex flex-col gap-4">
        <SettingsSectionLabel title="Active Direct Deposit Account" />
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFE2E2] text-primary">
                <Building2 className="size-4" aria-hidden />
              </div>
              <p className="truncate text-sm font-semibold text-[#111827] dark:text-white/90">
                No bank account on file
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#6B7280] dark:text-white/50">
            Add your bank details below to receive reimbursements.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard>
        <Formik
          initialValues={{
            accountHolder: "",
            bankName: "",
            accountNumber: "",
            isPrimary: true,
          }}
          validationSchema={bankDetailsSchema}
          onSubmit={async () => {
            setSaving(true);
            try {
              // Backend bank-details API is not wired yet (same as mobile stub).
              await new Promise((r) => setTimeout(r, 400));
              showSnackbar(
                "Bank details saved locally. Full sync is coming soon.",
                "success",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          {({
            values,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            dirty,
            isValid,
          }) => (
            <form
              className="flex flex-col gap-5 max-w-md"
              onSubmit={handleSubmit}
              noValidate
            >
              <SettingsSectionLabel title="Update Account Details" />
              <Input
                name="accountHolder"
                label="Account Holder Name"
                placeholder="Full name on account"
                value={values.accountHolder}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.accountHolder}
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />
              <Input
                name="bankName"
                label="Bank Name"
                placeholder="e.g. Access Bank"
                value={values.bankName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.bankName}
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />
              <Input
                name="accountNumber"
                label="Account Number"
                placeholder="0123456789"
                value={values.accountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.accountNumber}
                inputMode="numeric"
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />
              <div className="rounded-xl border border-[#E5E7EB] dark:border-white/10">
                <SettingsToggleRow
                  title="Set as primary reimbursement account"
                  value={values.isPrimary}
                  onValueChange={(next) => {
                    void setFieldValue("isPrimary", next);
                  }}
                  showDivider={false}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-fit rounded-md px-5 text-xs font-semibold"
                disabled={saving || !dirty || !isValid}
                loading={saving}
              >
                Save Details
              </Button>
            </form>
          )}
        </Formik>
      </SettingsCard>
    </SettingsShell>
  );
}
