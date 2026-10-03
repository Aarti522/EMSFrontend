import api from "./api";

export const getAllDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

// Alias for existing files such as Reports.jsx
export const getDepartments = getAllDepartments;

export const getDepartmentById = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const addDepartment = async (departmentData) => {
  const response = await api.post("/departments", departmentData);
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`/departments/${id}`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};