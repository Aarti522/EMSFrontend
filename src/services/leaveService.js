import api from "./api";

// ===============================
// GET ALL LEAVES
// ===============================
export const getLeaves = async () => {
  const response = await api.get("/leaves");
  return response.data;
};

// ===============================
// APPLY LEAVE
// ===============================
export const applyLeave = async (leaveData) => {
  const response = await api.post("/leaves", leaveData);
  return response.data;
};

// ===============================
// GET LEAVE BY EMPLOYEE ID
// ===============================
export const getLeavesByEmployeeId = async (employeeId) => {
  const response = await api.get(`/leaves/employee/${employeeId}`);
  return response.data;
};

// ===============================
// GET LEAVE BY ID
// ===============================
export const getLeaveById = async (id) => {
  const response = await api.get(`/leaves/${id}`);
  return response.data;
};

// ===============================
// APPROVE LEAVE
// ===============================
export const approveLeave = async (id) => {
  const response = await api.put(`/leaves/${id}/approve`);
  return response.data;
};

// ===============================
// REJECT LEAVE
// ===============================
export const rejectLeave = async (id) => {
  const response = await api.put(`/leaves/${id}/reject`);
  return response.data;
};

// ===============================
// DELETE LEAVE
// ===============================
export const deleteLeave = async (id) => {
  const response = await api.delete(`/leaves/${id}`);
  return response.data;
};