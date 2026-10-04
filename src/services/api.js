import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is not configured. Please set it in the environment variables."
  );
}

const api = axios.create({
  baseURL: API_URL.trim(),
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const publicEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    const isPublicEndpoint =
      publicEndpoints.some((endpoint) =>
        config.url?.startsWith(endpoint)
      );

    if (token && !isPublicEndpoint) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default api;