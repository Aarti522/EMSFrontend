import api from "./api";

// ========================================
// GET ALL ATTENDANCE
// ========================================

export const getAttendance = async () => {
  const response = await api.get("/attendance");
  return response.data;
};

// Alias for existing Reports.jsx
export const getAllAttendance = getAttendance;


// ========================================
// GET ATTENDANCE BY ID
// ========================================

export const getAttendanceById = async (id) => {
  const response = await api.get(`/attendance/${id}`);
  return response.data;
};


// ========================================
// GET ATTENDANCE BY EMPLOYEE ID
// ========================================

export const getAttendanceByEmployeeId = async (employeeId) => {
  const response = await api.get(
    `/attendance/employee/${employeeId}`
  );

  return response.data;
};


// ========================================
// GET ATTENDANCE BY DATE
// ========================================

export const getAttendanceByDate = async (date) => {
  const response = await api.get(
    `/attendance/date/${date}`
  );

  return response.data;
};


// ========================================
// ADD ATTENDANCE
// ADMIN / HR
// ========================================

export const addAttendance = async (attendance) => {
  const response = await api.post(
    "/attendance",
    attendance
  );

  return response.data;
};


// ========================================
// UPDATE ATTENDANCE
// ADMIN / HR
// ========================================

export const updateAttendance = async (
  id,
  attendance
) => {
  const response = await api.put(
    `/attendance/${id}`,
    attendance
  );

  return response.data;
};


// ========================================
// DELETE ATTENDANCE
// ADMIN / HR
// ========================================

export const deleteAttendance = async (id) => {
  const response = await api.delete(
    `/attendance/${id}`
  );

  return response.data;
};


// ========================================
// SELF CHECK-IN
// ADMIN / HR / MANAGER / EMPLOYEE
// ========================================

export const checkIn = async () => {
  const response = await api.post(
    "/attendance/check-in"
  );

  return response.data;
};


// ========================================
// SELF CHECK-OUT
// ADMIN / HR / MANAGER / EMPLOYEE
// ========================================

export const checkOut = async () => {
  const response = await api.post(
    "/attendance/check-out"
  );

  return response.data;
};