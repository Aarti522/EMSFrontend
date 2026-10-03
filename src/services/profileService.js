import api from "./api";

// Get logged-in user's profile
export const getMyProfile = async () => {
    const response = await api.get("/profile");
    return response.data;
};

// Update logged-in user's profile
export const updateMyProfile = async (profileData) => {
    const response = await api.put("/profile", profileData);
    return response.data;
};

// Complete first login
export const completeFirstLogin = async () => {
    const response = await api.put("/profile/complete-first-login");
    return response.data;
};
