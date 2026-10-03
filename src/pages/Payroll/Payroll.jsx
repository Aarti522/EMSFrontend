
import { useEffect, useState } from "react";
import "../../styles/payroll.css";

import {
  getAllSalaries,
  addSalary,
  updateSalary,
  deleteSalary,
} from "../../services/salaryService";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Payroll() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  const canManagePayroll =
    userRole === "ADMIN" || userRole === "HR";

  const isManager = userRole === "MANAGER";
  const isEmployee = userRole === "EMPLOYEE";
  const isHR = userRole === "HR";

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOGGED-IN USER'S EMPLOYEE ID
  // =========================================================

  const [myEmployeeId, setMyEmployeeId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // =========================================================
  // EDIT STATE
  // =========================================================

  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // =========================================================
  // EMPTY FORM
  // =========================================================

  const emptyForm = {
    employeeId: "",
    basicSalary: "",
    allowance: "",
    deduction: "",
    netSalary: "",
    month: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================================================
  // INITIALIZE PAYROLL
  // =========================================================

  useEffect(() => {
    const initializePayroll = async () => {
      await loadMyProfile();
      await loadSalary();
    };

    initializePayroll();
  }, []);

  // =========================================================
  // GET LOGGED-IN USER PROFILE
  // =========================================================

  const loadMyProfile = async () => {
    try {
      setProfileLoading(true);

      const response = await api.get("/profile");

      console.log("PROFILE RESPONSE:", response.data);

      const employeeId = response.data?.employeeId;

      console.log("LOGGED-IN EMPLOYEE ID:", employeeId);

      setMyEmployeeId(
        employeeId !== undefined && employeeId !== null
          ? Number(employeeId)
          : null
      );
    } catch (err) {
      console.error("Error loading profile:", err);
      setMyEmployeeId(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================================
  // LOAD SALARY
  // =========================================================

  const loadSalary = async () => {
    try {
      setLoading(true);

      const data = await getAllSalaries();

      setSalaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading salary:", err);
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...formData,
      [name]: value,
    };

    const basic = Number(updated.basicSalary || 0);
    const allowance = Number(updated.allowance || 0);
    const deduction = Number(updated.deduction || 0);

    updated.netSalary = basic + allowance - deduction;

    setFormData(updated);
  };

  // =========================================================
  // ADD / UPDATE SALARY
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // HR cannot manage own salary
      if (
        isHR &&
        myEmployeeId !== null &&
        Number(formData.employeeId) === Number(myEmployeeId)
      ) {
        alert("You cannot manage your own salary.");
        return;
      }

      if (editing) {
        await updateSalary(editId, formData);

        alert("Salary updated successfully");
      } else {
        await addSalary(formData);

        alert("Salary added successfully");
      }

      resetForm();

      await loadSalary();
    } catch (err) {
      console.error("Salary save error:", err);

      if (err.response?.status === 403) {
        alert(
          "You are not authorized to manage this salary record."
        );
      } else {
        alert("Unable to save salary");
      }
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (salary) => {
    if (
      isHR &&
      myEmployeeId !== null &&
      Number(salary.employeeId) === Number(myEmployeeId)
    ) {
      alert("You cannot edit your own salary.");
      return;
    }

    setEditing(true);
    setEditId(salary.id);

    setFormData({
      employeeId: salary.employeeId ?? "",
      basicSalary: salary.basicSalary ?? "",
      allowance: salary.allowance ?? "",
      deduction: salary.deduction ?? "",
      netSalary: salary.netSalary ?? "",
      month: salary.month ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (salary) => {
    if (
      isHR &&
      myEmployeeId !== null &&
      Number(salary.employeeId) === Number(myEmployeeId)
    ) {
      alert("You cannot delete your own salary.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this salary record?"
    );

    if (!confirmed) return;

    try {
      await deleteSalary(salary.id);

      alert("Salary deleted successfully");

      await loadSalary();
    } catch (err) {
      console.error("Delete salary error:", err);

      if (err.response?.status === 403) {
        alert(
          "You are not authorized to delete this salary record."
        );
      } else {
        alert("Unable to delete salary");
      }
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setEditing(false);
    setEditId(null);
    setFormData(emptyForm);
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  // =========================================================
  // TOTAL PAYROLL
  // =========================================================

  const totalPayroll = salaries.reduce(
    (total, salary) =>
      total + Number(salary.netSalary || 0),
    0
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading || (isHR && profileLoading)) {
    return (
      <div className="payroll-container">
        <div className="payroll-loading">
          <span className="payroll-loading-spinner"></span>
          <span>Loading payroll...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="payroll-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="payroll-page-header">

        <div className="payroll-title-section">

          <div className="payroll-eyebrow">
            Salary & Compensation
          </div>

          <h2>Payroll Management</h2>

          <p>
            {userRole === "ADMIN" &&
              "Manage salary records and payroll information for all employees."}

            {userRole === "HR" &&
              "Manage salary records and payroll information for all employees."}

            {isManager &&
              "View salary information and payroll details of your team."}

            {isEmployee &&
              "View your personal salary and payroll information."}
          </p>

        </div>


        <div className="payroll-role-badge">

          <span className="payroll-role-dot"></span>

          <strong>{userRole}</strong>

          <span className="payroll-role-divider">•</span>

          <span>
            {canManagePayroll && "All Employees"}

            {isManager && "My Team"}

            {isEmployee && "My Salary"}
          </span>

        </div>

      </div>


      {/* =====================================================
          ADD / UPDATE FORM
      ===================================================== */}

      {canManagePayroll && (

        <form
          className="payroll-form"
          onSubmit={handleSubmit}
        >

          <div className="payroll-form-header">

            <div className="payroll-form-icon">
              ₹
            </div>

            <div>
              <div className="form-title">
                {editing
                  ? "Update Salary"
                  : "Add Employee Salary"}
              </div>

              <p>
                {editing
                  ? "Update the selected employee's payroll information."
                  : "Enter salary details to create a new payroll record."}
              </p>
            </div>

          </div>


          <div className="form-grid">

            {/* Employee ID */}

            <div className="form-field">

              <label>
                Employee ID
              </label>

              <div className="payroll-input-wrapper">

                <span className="payroll-input-icon">
                  #
                </span>

                <input
                  type="number"
                  name="employeeId"
                  placeholder="Enter Employee ID"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Basic Salary */}

            <div className="form-field">

              <label>
                Basic Salary
              </label>

              <div className="payroll-input-wrapper">

                <span className="payroll-input-icon">
                  ₹
                </span>

                <input
                  type="number"
                  name="basicSalary"
                  placeholder="Enter Basic Salary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>

            </div>


            {/* Allowance */}

            <div className="form-field">

              <label>
                Allowance
              </label>

              <div className="payroll-input-wrapper">

                <span className="payroll-input-icon">
                  +
                </span>

                <input
                  type="number"
                  name="allowance"
                  placeholder="Enter Allowance"
                  value={formData.allowance}
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>

            </div>


            {/* Deduction */}

            <div className="form-field">

              <label>
                Deduction
              </label>

              <div className="payroll-input-wrapper">

                <span className="payroll-input-icon">
                  −
                </span>

                <input
                  type="number"
                  name="deduction"
                  placeholder="Enter Deduction"
                  value={formData.deduction}
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>

            </div>


            {/* Payroll Month */}

            <div className="form-field">

              <label>
                Payroll Month
              </label>

              <div className="payroll-input-wrapper">

                <span className="payroll-input-icon">
                  📅
                </span>

                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Net Salary */}

            <div className="form-field">

              <label>
                Net Salary
              </label>

              <div className="payroll-input-wrapper payroll-net-input">

                <span className="payroll-input-icon">
                  ✓
                </span>

                <input
                  type="number"
                  name="netSalary"
                  value={formData.netSalary}
                  readOnly
                />

              </div>

              <small className="net-salary-helper">
                Basic + Allowance − Deduction
              </small>

            </div>

          </div>


          <div className="button-group">

            <button
              className="save-btn"
              type="submit"
            >
              <span>
                {editing ? "✓" : "+"}
              </span>

              {editing
                ? "Update Salary"
                : "Add Salary"}
            </button>


            {editing && (

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      )}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="payroll-summary">

        {/* Total Records */}

        <div className="summary-card payroll-summary-records">

          <div className="summary-card-icon">
            📄
          </div>

          <div className="summary-card-content">

            <span>
              Total Records
            </span>

            <strong>
              {salaries.length}
            </strong>

          </div>

        </div>


        {/* Total / Team Payroll */}

        {(canManagePayroll || isManager) && (

          <div className="summary-card payroll-summary-money">

            <div className="summary-card-icon">
              ₹
            </div>

            <div className="summary-card-content">

              <span>
                {canManagePayroll
                  ? "Total Payroll"
                  : "Team Payroll"}
              </span>

              <strong>
                ₹ {formatCurrency(totalPayroll)}
              </strong>

            </div>

          </div>

        )}


        {/* Employee Records */}

        {isEmployee && (

          <div className="summary-card payroll-summary-personal">

            <div className="summary-card-icon">
              👤
            </div>

            <div className="summary-card-content">

              <span>
                Your Salary Records
              </span>

              <strong>
                {salaries.length}
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="payroll-table-card">

        <div className="payroll-table-header">

          <div>

            <div className="payroll-table-title">

              <span className="payroll-table-title-icon">
                💰
              </span>

              <h3>
                Salary Records
              </h3>

            </div>

            <p>
              {canManagePayroll
                ? "Manage employee salary and payroll records."
                : isManager
                ? "Salary information available for your team."
                : "Your personal salary records."}
            </p>

          </div>

          <div className="payroll-record-count">
            {salaries.length}{" "}
            {salaries.length === 1
              ? "Record"
              : "Records"}
          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="payroll-table-wrapper">

          <table className="payroll-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Employee ID</th>

                <th>Basic Salary</th>

                <th>Allowance</th>

                <th>Deduction</th>

                <th>Net Salary</th>

                <th>Month</th>

                {canManagePayroll && (
                  <th>Action</th>
                )}

              </tr>

            </thead>


            <tbody>

              {salaries.length === 0 ? (

                <tr>

                  <td
                    colSpan={
                      canManagePayroll
                        ? 8
                        : 7
                    }
                    className="no-data"
                  >

                    <div className="payroll-empty">

                      <div className="payroll-empty-icon">
                        💰
                      </div>

                      <strong>
                        No Salary Records Found
                      </strong>

                      <span>
                        Payroll information will appear here once records are available.
                      </span>

                    </div>

                  </td>

                </tr>

              ) : (

                salaries.map((salary) => {

                  // =================================================
                  // HR OWN SALARY CHECK
                  // =================================================

                  const isOwnSalary =
                    isHR &&
                    myEmployeeId !== null &&
                    Number(salary.employeeId) ===
                      Number(myEmployeeId);

                  return (

                    <tr key={salary.id}>

                      {/* ID */}

                      <td>

                        <span className="payroll-id">
                          #{salary.id}
                        </span>

                      </td>


                      {/* Employee ID */}

                      <td>

                        <span className="employee-id-badge">
                          EMP-{salary.employeeId}
                        </span>

                      </td>


                      {/* Basic Salary */}

                      <td>

                        <span className="salary-amount">
                          ₹ {formatCurrency(salary.basicSalary)}
                        </span>

                      </td>


                      {/* Allowance */}

                      <td>

                        <span className="allowance-amount">
                          ₹ {formatCurrency(salary.allowance)}
                        </span>

                      </td>


                      {/* Deduction */}

                      <td>

                        <span className="deduction">
                          − ₹ {formatCurrency(salary.deduction)}
                        </span>

                      </td>


                      {/* Net Salary */}

                      <td>

                        <span className="net-salary">
                          ₹ {formatCurrency(salary.netSalary)}
                        </span>

                      </td>


                      {/* Month */}

                      <td>

                        <span className="payroll-month">
                          📅 {salary.month}
                        </span>

                      </td>


                      {/* =================================================
                          ACTION COLUMN
                      ================================================= */}

                      {canManagePayroll && (

                        <td>

                          {isOwnSalary ? (

                            <span className="own-salary">
                              🔒 View Only
                            </span>

                          ) : (

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() =>
                                  handleEdit(salary)
                                }
                                title="Edit salary"
                              >
                                ✎
                                <span>Edit</span>
                              </button>


                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                  handleDelete(salary)
                                }
                                title="Delete salary"
                              >
                                ×
                                <span>Delete</span>
                              </button>

                            </div>

                          )}

                        </td>

                      )}

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Payroll;
