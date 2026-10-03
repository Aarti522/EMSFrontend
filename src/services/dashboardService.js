import api from "./api";

// Get dashboard data for logged-in user
export const getDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};