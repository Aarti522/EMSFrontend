import api from "./api";

export const getAllEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

// Alias for existing files such as Reports.jsx
export const getEmployees = getAllEmployees;

export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const addEmployee = async (employeeData) => {
  const response = await api.post("/employees", employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const getEmployeesByDepartment = async (departmentId) => {
  const response = await api.get(`/employees/department/${departmentId}`);
  return response.data;
};