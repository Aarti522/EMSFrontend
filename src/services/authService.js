import api from "./api";

// =========================
// LOGIN
// =========================

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// =========================
// REGISTER
// =========================

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

// =========================
// FORGOT PASSWORD - SEND OTP
// =========================

export const sendForgotPasswordOtp = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

// =========================
// RESET PASSWORD
// =========================

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  const response = await api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });

  return response.data;
};