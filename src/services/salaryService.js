import api from "./api";

// GET ALL SALARIES
export const getAllSalaries = async () => {
  const response = await api.get("/salary");
  return response.data;
};

// GET SALARY BY ID
export const getSalaryById = async (id) => {
  const response = await api.get(`/salary/${id}`);
  return response.data;
};

// GET SALARY BY EMPLOYEE ID
export const getSalaryByEmployeeId = async (employeeId) => {
  const response = await api.get(`/salary/employee/${employeeId}`);
  return response.data;
};

// ADD SALARY
export const addSalary = async (salary) => {
  const response = await api.post("/salary", salary);
  return response.data;
};

// UPDATE SALARY
export const updateSalary = async (id, salary) => {
  const response = await api.put(`/salary/${id}`, salary);
  return response.data;
};

// DELETE SALARY
export const deleteSalary = async (id) => {
  const response = await api.delete(`/salary/${id}`);
  return response.data;
};