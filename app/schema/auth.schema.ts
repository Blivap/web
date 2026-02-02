import * as yup from "yup";
export const registerSchema = yup.object({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
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

export const resetPasswordSchema = yup.object({
  resetToken: yup.string().required("Reset token is required"),
  password: passwordRule,
});

export const changePasswordSchema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  password: passwordRule,
});

export const editProfileSchema = yup.object({
  firstname: yup.string().optional(),
  lastname: yup.string().optional(),
  phonenumber: yup.string().nullable().optional(),
  profileImage: yup.string().url("Invalid URL").nullable().optional(),
});
