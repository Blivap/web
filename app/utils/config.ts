const config = () => {
  return {
    url: process.env.BASE_URL || "http://localhost:3000",
    apiUrl: process.env.API_URL || "http://localhost:3000",
    env: process.env.ENVIRONMENT || "development",
  };
};
export default config;
