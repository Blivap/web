import * as yup from "yup";
export const registerSchema = yup.object({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneCountryCode: yup
    .string()
    .required("Country code is required")
    .matches(/^\+\d{1,6}$/, "Invalid country code"),
  phoneNational: yup
    .string()
    .required("Phone number is required")
    .test("phone-national", "Enter 6–15 digits", (v) => {
      const d = (v ?? "").replace(/\D/g, "");
      return d.length >= 6 && d.length <= 15;
    }),
  dateOfBirth: yup.string().required("Date of Birth is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
      "Password must contain at least one uppercase letter, one special character, and be at least 8 characters long",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Retype your password"),
  termsAndCondition: yup.boolean().oneOf([true]).required(),
  privacyStatement: yup.boolean().oneOf([true]).required(),
});
export const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const passwordRule = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .matches(
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    "Password must contain at least one uppercase letter, one special character, and be at least 8 characters long",
  )
  .required("Password is required");

export const verifyEmailSchema = yup.object({
  emailValidationToken: yup.string().required("Verification token is required"),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

/** Form fields only; reset token is supplied from the URL, not shown in the UI. */
export const resetPasswordSchema = yup.object({
  password: passwordRule,
});

export const changePasswordSchema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  password: passwordRule,
});

export const editProfileSchema = yup.object({
  firstname: yup.string().trim().optional().nullable(),
  lastname: yup.string().trim().optional().nullable(),
  phoneCountryCode: yup
    .string()
    .optional()
    .nullable()
    .default("+234")
    .matches(/^\+\d{1,6}$/, "Invalid country code"),
  phoneNational: yup
    .string()
    .default("")
    .test("phone-national", "Enter 6–15 digits, or leave empty", (v) => {
      const d = (v ?? "").replace(/\D/g, "");
      return d.length === 0 || (d.length >= 6 && d.length <= 15);
    }),
  dateOfBirth: yup.string().optional().nullable(),
  profileImage: yup
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v))
    .test(
      "url-or-empty",
      "Invalid image URL",
      (v) => !v || yup.string().url().isValidSync(v),
    ),
});
