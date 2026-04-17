/**
 * HTTP paths relative to API base URL — see api-endpoints.txt (NestJS controllers).
 */

export const endpoints = {
  root: "/",

  hospitals: {
    list: "/hospitals",
    create: "/hospitals",
  },

  bloodRequests: {
    create: "/blood-requests",
    mine: "/blood-requests/mine",
  },

  donors: {
    list: "/donors",
    detail: (id: string) => `/donors/${encodeURIComponent(id)}`,
    register: "/donors/register",
    questionnaire: "/donors/questionnaire",
    requestActivation: "/donors/request-activation",
    requestRetake: "/donors/request-retake",
    location: "/donors/location",
    me: "/donors/me",
    public: (userId: string) => `/donors/public/${userId}`,
  },

  matching: {
    bloodRequest: (id: string) => `/matching/blood-requests/${id}`,
    search: "/matching/search",
  },

  bookings: {
    create: "/bookings",
    respond: (id: string) => `/bookings/${id}/respond`,
    cancel: (id: string) => `/bookings/${id}/cancel`,
    mine: "/bookings/mine",
  },

  notifications: {
    list: "/notifications",
    read: (id: string) => `/notifications/${id}/read`,
    pushSubscriptions: {
      fcm: "/notifications/push-subscriptions/fcm",
      web: "/notifications/push-subscriptions/web",
    },
  },

  /** Primary authentication routes (`authentication` controller) */
  auth: {
    login: "/authentication/login",
    /** Maps to POST /authentication/signup */
    register: "/authentication/signup",
    signup: "/authentication/signup",
    verifyEmail: "/authentication/verify-email",
    resendEmailVerificationLink:
      "/authentication/resend-email-verification-link",
    resendEmailVerificationLinkWithParams: (params: Record<string, string>) =>
      `/authentication/resend-email-verification-link?${new URLSearchParams(params).toString()}`,
    forgotPassword: "/authentication/forgot-password",
    resetPassword: "/authentication/reset-password",
    me: "/authentication/me",
    getProfile: "/authentication/me",
    changePassword: "/authentication/change-password",
    logout: "/authentication/logout",
  },

  /** Password-reset aliases (`auth` controller) */
  authAliases: {
    requestPasswordReset: "/auth/request-password-reset",
    resetPassword: "/auth/reset-password",
  },

  ninVerification: "/nin-verification",
  avatar: "/avatar",
} as const;
