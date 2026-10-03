import api from "./api";

// Get live report analytics
export const getAnalytics = async () => {
    const response = await api.get("/reports/analytics");
    return response.data;
};

// Employee report
export const getEmployeeReport = async () => {
    const response = await api.get("/reports/employees");
    return response.data;
};

// Attendance report
export const getAttendanceReport = async () => {
    const response = await api.get("/reports/attendance");
    return response.data;
};

// Leave report
export const getLeaveReport = async () => {
    const response = await api.get("/reports/leaves");
    return response.data;
};

// Salary / Payroll report
export const getSalaryReport = async () => {
    const response = await api.get("/reports/salary");
    return response.data;
};

// Department report
export const getDepartmentReport = async () => {
    const response = await api.get("/reports/departments");
    return response.data;
};
