import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/employeeService";

import { getAllDepartments } from "../../services/departmentService";

import "../../styles/employees.css";


function Employees() {

  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // =====================================================
  // PERMISSION
  // =====================================================

  const canManageEmployees =
    userRole === "ADMIN" || userRole === "HR";


  // =====================================================
  // STATE
  // =====================================================

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");


  // =====================================================
  // FORM STATE
  // =====================================================

  const initialForm = {
    name: "",
    email: "",
    salary: "",
    phone: "",
    address: "",
    designation: "",
    departmentId: "",
    status: "ACTIVE",
  };

  const [formData, setFormData] = useState(initialForm);


  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  const loadEmployees = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getAllEmployees();

      setEmployees(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Employees loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load employees."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD DEPARTMENTS
  // Needed for Add/Edit department dropdown
  // =====================================================

  const loadDepartments = async () => {

    if (!canManageEmployees) {
      return;
    }

    try {

      const data = await getAllDepartments();

      setDepartments(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Departments loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load departments."
      );

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadEmployees();
    loadDepartments();

  }, [userRole]);


  // =====================================================
  // FORM INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const handleAddClick = () => {

    setEditingEmployee(null);

    setFormData(initialForm);

    setError("");
    setSuccess("");

    setShowModal(true);
  };


  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleEditClick = (employee) => {

    setEditingEmployee(employee);

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      salary: employee.salary ?? "",
      phone: employee.phone || "",
      address: employee.address || "",
      designation: employee.designation || "",
      departmentId: employee.department?.id || "",
      status: employee.status || "ACTIVE",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {

    setShowModal(false);
    setEditingEmployee(null);
    setFormData(initialForm);

  };


  // =====================================================
  // SUBMIT ADD / EDIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    // -----------------------------------------------------
    // Basic validation
    // -----------------------------------------------------

    if (!formData.name.trim()) {

      setError("Employee name is required.");
      return;

    }

    if (!formData.email.trim()) {

      setError("Employee email is required.");
      return;

    }

    if (!formData.departmentId) {

      setError("Please select a department.");
      return;

    }


    // -----------------------------------------------------
    // Backend Employee object
    // -----------------------------------------------------

    const employeeData = {

      name: formData.name.trim(),

      email: formData.email.trim(),

      salary: Number(formData.salary) || 0,

      phone: formData.phone.trim(),

      address: formData.address.trim(),

      designation: formData.designation.trim(),

      department: {
        id: Number(formData.departmentId),
      },

      status: formData.status || "ACTIVE",
    };


    try {

      if (editingEmployee) {

        // =========================
        // UPDATE
        // =========================

        await updateEmployee(
          editingEmployee.id,
          employeeData
        );

        setSuccess(
          "Employee updated successfully."
        );

      } else {

        // =========================
        // ADD
        // =========================

        await addEmployee(employeeData);

        setSuccess(
          "Employee added successfully."
        );
      }


      // Close modal

      setShowModal(false);
      setEditingEmployee(null);
      setFormData(initialForm);


      // Refresh employee list

      await loadEmployees();


    } catch (err) {

      console.error(
        "Employee save error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to save employee."
      );

    }

  };


  // =====================================================
  // DEACTIVATE EMPLOYEE
  // Backend:
  // DELETE /employees/{id}
  // actually sets status = INACTIVE
  // =====================================================

  const handleDeactivate = async (employee) => {

    if (!employee?.id) {
      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${employee.name}?`
    );


    if (!confirmed) {
      return;
    }


    try {

      setError("");
      setSuccess("");

      await deleteEmployee(employee.id);

      setSuccess(
        "Employee deactivated successfully."
      );

      await loadEmployees();

    } catch (err) {

      console.error(
        "Employee deactivation error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to deactivate employee."
      );

    }

  };


  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredEmployees = employees.filter(
    (employee) => {

      const search = searchTerm
        .toLowerCase()
        .trim();


      const matchesSearch =
        !search ||
        employee.name
          ?.toLowerCase()
          .includes(search) ||
        employee.email
          ?.toLowerCase()
          .includes(search) ||
        employee.designation
          ?.toLowerCase()
          .includes(search) ||
        employee.phone
          ?.toLowerCase()
          .includes(search);


      const matchesDepartment =
        !departmentFilter ||
        String(employee.department?.id) ===
          String(departmentFilter);


      const matchesStatus =
        !statusFilter ||
        employee.status?.toUpperCase() ===
          statusFilter;


      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );

    }
  );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="employees-page">

        <div className="employees-loading">
          Loading employees...
        </div>

      </div>
    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="employees-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="employees-header">

        <div>

          <h1>Employees</h1>

          <p>
            Manage and view employee information
          </p>

        </div>


        {/* ADMIN / HR ONLY */}

        {canManageEmployees && (

          <button
            className="employee-add-btn"
            onClick={handleAddClick}
          >
            + Add Employee
          </button>

        )}

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (

        <div className="employee-alert employee-alert-error">
          {error}
        </div>

      )}


      {success && (

        <div className="employee-alert employee-alert-success">
          {success}
        </div>

      )}


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="employees-filters">

        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="employee-search"
        />


        <select
          value={departmentFilter}
          onChange={(e) =>
            setDepartmentFilter(e.target.value)
          }
          className="employee-filter"
        >

          <option value="">
            All Departments
          </option>

          {departments.map((department) => (

            <option
              key={department.id}
              value={department.id}
            >
              {department.name}
            </option>

          ))}

        </select>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="employee-filter"
        >

          <option value="">
            All Status
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>

        </select>

      </div>


      {/* =================================================
          EMPLOYEE TABLE
      ================================================= */}

      <div className="employees-table-container">

        <table className="employees-table">

          <thead>

            <tr>

              <th>ID</th>

              <th>Name</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Designation</th>

              <th>Department</th>

              <th>Salary</th>

              <th>Status</th>

              {canManageEmployees && (
                <th>Actions</th>
              )}

            </tr>

          </thead>


          <tbody>

            {filteredEmployees.length === 0 ? (

              <tr>

                <td
                  colSpan={
                    canManageEmployees ? 9 : 8
                  }
                  className="no-employees"
                >
                  No employees found.
                </td>

              </tr>

            ) : (

              filteredEmployees.map((employee) => (

                <tr key={employee.id}>

                  <td>
                    {employee.id}
                  </td>

                  <td>
                    {employee.name}
                  </td>

                  <td>
                    {employee.email}
                  </td>

                  <td>
                    {employee.phone || "-"}
                  </td>

                  <td>
                    {employee.designation || "-"}
                  </td>

                  <td>
                    {employee.department?.name || "-"}
                  </td>

                  <td>
                    ₹{Number(employee.salary || 0).toLocaleString("en-IN")}
                  </td>

                  <td>

                    <span
                      className={
                        employee.status?.toUpperCase() ===
                        "ACTIVE"
                          ? "status-badge status-active"
                          : "status-badge status-inactive"
                      }
                    >
                      {employee.status || "UNKNOWN"}
                    </span>

                  </td>


                  {/* =================================================
                      ADMIN / HR ACTIONS
                  ================================================= */}

                  {canManageEmployees && (

                    <td className="employee-actions">

                      <button
                        className="employee-edit-btn"
                        onClick={() =>
                          handleEditClick(employee)
                        }
                        disabled={
                          employee.status?.toUpperCase() ===
                          "INACTIVE"
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="employee-deactivate-btn"
                        onClick={() =>
                          handleDeactivate(employee)
                        }
                        disabled={
                          employee.status?.toUpperCase() ===
                          "INACTIVE"
                        }
                      >
                        Deactivate
                      </button>

                    </td>

                  )}

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div className="employee-modal-overlay">

          <div className="employee-modal">

            <div className="employee-modal-header">

              <h2>
                {editingEmployee
                  ? "Edit Employee"
                  : "Add Employee"}
              </h2>

              <button
                className="employee-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="employee-form"
            >

              {/* NAME */}

              <div className="form-group">

                <label>
                  Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter employee email"
                  required
                />

              </div>


              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

              </div>


              {/* DESIGNATION */}

              <div className="form-group">

                <label>
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Software Developer"
                />

              </div>


              {/* DEPARTMENT */}

              <div className="form-group">

                <label>
                  Department *
                </label>

                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (

                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* SALARY */}

              <div className="form-group">

                <label>
                  Salary
                </label>

                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter salary"
                  min="0"
                />

              </div>


              {/* ADDRESS */}

              <div className="form-group full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter employee address"
                  rows="3"
                />

              </div>


              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>

                </select>

              </div>


              {/* BUTTONS */}

              <div className="employee-form-actions">

                <button
                  type="button"
                  className="employee-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-btn"
                >
                  {editingEmployee
                    ? "Update Employee"
                    : "Add Employee"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default Employees;