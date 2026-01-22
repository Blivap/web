export const config = {
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  env: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
};
