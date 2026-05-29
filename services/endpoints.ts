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
    /** Clinical / intent profile (JWT). Optional for POST /donors/request-activation. */
    screeningProfile: "/donors/screening-profile",
    ratings: (id: string) => `/donors/${encodeURIComponent(id)}/ratings`,
  },

  /** Per–donation-type AI questionnaire (JWT). Does not gate activation. */
  questionnaire: {
    generate: "/questionnaire/generate",
    mine: "/questionnaire/my",
    answer: (questionnaireId: string) =>
      `/questionnaire/${encodeURIComponent(questionnaireId)}/answer`,
    regenerate: (questionnaireId: string) =>
      `/questionnaire/${encodeURIComponent(questionnaireId)}/regenerate`,
  },

  matching: {
    bloodRequest: (id: string) => `/matching/blood-requests/${id}`,
    search: "/matching/search",
  },

  bookings: {
    /** Preferred: same body as legacy POST /bookings */
    request: "/bookings/request",
    create: "/bookings",
    sent: "/bookings/sent",
    received: "/bookings/received",
    mine: "/bookings/mine",
    respond: (id: string) => `/bookings/${encodeURIComponent(id)}/respond`,
    accept: (id: string) => `/bookings/${encodeURIComponent(id)}/accept`,
    decline: (id: string) => `/bookings/${encodeURIComponent(id)}/decline`,
    cancel: (id: string) => `/bookings/${encodeURIComponent(id)}/cancel`,
    report: (id: string) => `/bookings/${encodeURIComponent(id)}/report`,
    /** Optional: notify donor again (rebuzz / reminder). Backend must implement. */
    remind: (id: string) => `/bookings/${encodeURIComponent(id)}/remind`,
    rating: (bookingId: string) =>
      `/bookings/${encodeURIComponent(bookingId)}/rating`,
  },

  meetups: {
    ensureSession: (bookingId: string) =>
      `/meetups/bookings/${encodeURIComponent(bookingId)}/session`,
    session: (sessionId: string) => `/meetups/${encodeURIComponent(sessionId)}`,
    verifyCode: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/verify-code`,
    verifyQr: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/verify-qr`,
    requesterConfirm: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/requester-confirm`,
    donorConfirm: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/donor-confirm`,
    complete: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/complete`,
    report: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/report`,
    terminate: (sessionId: string) =>
      `/meetups/${encodeURIComponent(sessionId)}/terminate`,
  },

  /** Donation coordination chat (`donationId` = booking id). Live traffic uses Socket.IO `/chat`. */
  chat: {
    messages: (donationId: string) =>
      `/chat/${encodeURIComponent(donationId)}/messages`,
    arrived: (donationId: string) =>
      `/chat/${encodeURIComponent(donationId)}/arrived`,
    media: (donationId: string) =>
      `/chat/${encodeURIComponent(donationId)}/media`,
  },

  news: "/news",

  notifications: {
    list: "/notifications",
    read: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
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
