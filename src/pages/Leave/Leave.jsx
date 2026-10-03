import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  getLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from "../../services/leaveService";

import api from "../../services/api";

import "../../styles/leave.css";

function Leave() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  // ==========================================
  // LOGGED-IN EMPLOYEE ID
  // ==========================================

  const [myEmployeeId, setMyEmployeeId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [employeeFilter, setEmployeeFilter] = useState("");

  // ==========================================
  // LOAD PROFILE
  // ==========================================

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

  // ==========================================
  // LOAD LEAVES
  // ==========================================

  useEffect(() => {
    const initializeLeavePage = async () => {
      await loadMyProfile();
      await loadLeaves();
    };

    initializeLeavePage();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLeaves();

      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching leaves:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // APPLY LEAVE
  // ==========================================

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      // Start date validation
      if (!formData.startDate) {
        setError("Please select start date.");
        return;
      }

      // End date validation
      if (!formData.endDate) {
        setError("Please select end date.");
        return;
      }

      // Date validation
      if (formData.endDate < formData.startDate) {
        setError("End date cannot be before start date.");
        return;
      }

      // Reason validation
      if (!formData.reason.trim()) {
        setError("Please enter leave reason.");
        return;
      }

      const leaveData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      };

      // ==========================================
      // ADMIN / HR
      // Employee ID required
      // ==========================================

      if (userRole === "ADMIN" || userRole === "HR") {
        if (!formData.employeeId) {
          setError("Please enter Employee ID.");
          return;
        }

        leaveData.employeeId = Number(formData.employeeId);
      }

      // ==========================================
      // MANAGER / EMPLOYEE
      // Backend automatically uses own employee ID
      // ==========================================

      const response = await applyLeave(leaveData);

      console.log("Leave applied:", response);

      setSuccess("Leave applied successfully.");

      // Reset form
      setFormData({
        employeeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setShowForm(false);

      // Reload leaves
      await loadLeaves();
    } catch (err) {
      console.error("Error applying leave:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to apply leave."
      );
    }
  };

  // ==========================================
  // APPROVE LEAVE
  // ==========================================

  const handleApprove = async (id) => {
    try {
      setError("");
      setSuccess("");

      await approveLeave(id);

      setSuccess("Leave approved successfully.");

      await loadLeaves();
    } catch (err) {
      console.error("Error approving leave:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to approve leave."
      );
    }
  };

  // ==========================================
  // REJECT LEAVE
  // ==========================================

  const handleReject = async (id) => {
    try {
      setError("");
      setSuccess("");

      await rejectLeave(id);

      setSuccess("Leave rejected successfully.");

      await loadLeaves();
    } catch (err) {
      console.error("Error rejecting leave:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to reject leave."
      );
    }
  };

  // ==========================================
  // DELETE LEAVE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteLeave(id);

      setSuccess("Leave deleted successfully.");

      await loadLeaves();
    } catch (err) {
      console.error("Error deleting leave:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to delete leave."
      );
    }
  };

  // ==========================================
  // FILTER
  // ADMIN / HR ONLY
  // ==========================================

  const filteredLeaves = leaves.filter((leave) => {
    if (!employeeFilter) {
      return true;
    }

    return (
      String(leave.employeeId) === String(employeeFilter)
    );
  });

  const handleClearFilter = () => {
    setEmployeeFilter("");
  };

  // ==========================================
  // PERMISSIONS
  // ==========================================

  const canApplyLeave =
    userRole === "ADMIN" ||
    userRole === "HR" ||
    userRole === "MANAGER" ||
    userRole === "EMPLOYEE";

  // ==========================================
  // CHECK IF LEAVE BELONGS TO CURRENT USER
  // ==========================================

  const isOwnLeave = (leave) => {
    if (myEmployeeId === null) {
      return false;
    }

    return (
      Number(leave.employeeId) === Number(myEmployeeId)
    );
  };

  // ==========================================
  // APPROVE / REJECT PERMISSION
  // ==========================================

  const canApproveLeave = (leave) => {
    // ADMIN
    if (userRole === "ADMIN") {
      return true;
    }

    // EMPLOYEE cannot approve anyone
    if (userRole === "EMPLOYEE") {
      return false;
    }

    // Own leave cannot be approved by MANAGER or HR
    if (isOwnLeave(leave)) {
      return false;
    }

    // MANAGER
    // Backend decides whether employee belongs to manager's team
    if (userRole === "MANAGER") {
      return true;
    }

    // HR
    // HR can approve Manager + Employee leaves
    if (userRole === "HR") {
      return true;
    }

    return false;
  };

  // ==========================================
  // DELETE PERMISSION
  // ==========================================

  const canDeleteLeave = (leave) => {
    // ADMIN
    if (userRole === "ADMIN") {
      return true;
    }

    // EMPLOYEE cannot delete
    if (userRole === "EMPLOYEE") {
      return false;
    }

    // Own leave cannot be deleted by MANAGER or HR
    if (isOwnLeave(leave)) {
      return false;
    }

    // MANAGER
    // Backend checks whether leave belongs to team
    if (userRole === "MANAGER") {
      return true;
    }

    // HR
    // Backend allows Manager + Employee leaves
    if (userRole === "HR") {
      return true;
    }

    return false;
  };

  // ==========================================
  // ROLE TITLE
  // ==========================================

  const getRoleTitle = () => {
    if (userRole === "ADMIN") {
      return "All Leave Requests";
    }

    if (userRole === "HR") {
      return "All Employee Leaves";
    }

    if (userRole === "MANAGER") {
      return "Team Leave Requests";
    }

    if (userRole === "EMPLOYEE") {
      return "My Leave Requests";
    }

    return "Leave Requests";
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      employeeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    });

    setError("");
  };

  const handleOpenForm = () => {
    resetForm();
    setSuccess("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusClass = (status) => {
    const normalizedStatus = status?.toUpperCase();

    if (normalizedStatus === "APPROVED") {
      return "status-approved";
    }

    if (normalizedStatus === "REJECTED") {
      return "status-rejected";
    }

    return "status-pending";
  };

  const formatStatus = (status) => {
    if (!status) {
      return "PENDING";
    }

    return status.toUpperCase();
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="leave-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="leave-header">

        <div>
          <h2>Leave Management</h2>

          <p>{getRoleTitle()}</p>
        </div>

        <div className="leave-header-actions">

          {canApplyLeave && (
            <button
              type="button"
              className="leave-add-btn"
              onClick={handleOpenForm}
            >
              + Apply Leave
            </button>
          )}

        </div>
      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {success && (
        <div className="leave-success">
          {success}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="leave-error">
          {error}
        </div>
      )}

      {/* ======================================
          APPLY LEAVE FORM
      ====================================== */}

      {showForm && (
        <div className="leave-form-card">

          <div className="leave-form-header">

            <div>
              <h3>Apply Leave</h3>

              <p>
                Submit a new leave request
              </p>
            </div>

            <button
              type="button"
              className="leave-close-btn"
              onClick={handleCloseForm}
            >
              ×
            </button>

          </div>

          <form
            className="leave-form"
            onSubmit={handleApplyLeave}
          >

            {/* ==================================
                EMPLOYEE ID
                ADMIN / HR ONLY
            ================================== */}

            {(userRole === "ADMIN" ||
              userRole === "HR") && (

              <div className="form-group">

                <label htmlFor="employeeId">
                  Employee ID
                </label>

                <input
                  type="number"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                />

              </div>
            )}

            {/* ==================================
                START DATE
            ================================== */}

            <div className="form-group">

              <label htmlFor="startDate">
                Start Date
              </label>

              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

            </div>

            {/* ==================================
                END DATE
            ================================== */}

            <div className="form-group">

              <label htmlFor="endDate">
                End Date
              </label>

              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />

            </div>

            {/* ==================================
                REASON
            ================================== */}

            <div className="form-group form-group-full">

              <label htmlFor="reason">
                Reason
              </label>

              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for leave"
                rows="4"
                required
              />

            </div>

            {/* ==================================
                FORM BUTTONS
            ================================== */}

            <div className="leave-form-actions">

              <button
                type="button"
                className="leave-cancel-btn"
                onClick={handleCloseForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="leave-submit-btn"
              >
                Apply Leave
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ======================================
          ADMIN / HR FILTER
      ====================================== */}

      {(userRole === "ADMIN" ||
        userRole === "HR") && (

        <div className="leave-filter-card">

          <div className="leave-filter-group">

            <label htmlFor="employeeFilter">
              Employee ID
            </label>

            <input
              type="number"
              id="employeeFilter"
              value={employeeFilter}
              onChange={(e) =>
                setEmployeeFilter(e.target.value)
              }
              placeholder="Search by Employee ID"
            />

          </div>

          <button
            type="button"
            className="leave-clear-filter-btn"
            onClick={handleClearFilter}
          >
            Clear
          </button>

        </div>
      )}

      {/* ======================================
          SUMMARY
      ====================================== */}

      {!loading && !error && (
        <div className="leave-summary">

          <span>
            Total Requests:

            <strong>
              {" "}
              {filteredLeaves.length}
            </strong>
          </span>

        </div>
      )}

      {/* ======================================
          TABLE CARD
      ====================================== */}

      <div className="leave-table-card">

        <div className="leave-table-header">

          <div>
            <h3>Leave Requests</h3>

            <p>{getRoleTitle()}</p>
          </div>

        </div>

        {/* ====================================
            LOADING
        ==================================== */}

        {loading || profileLoading ? (

          <div className="leave-loading">
            Loading leave requests...
          </div>

        ) : filteredLeaves.length === 0 ? (

          /* ==================================
             EMPTY
          ================================== */

          <div className="leave-empty">

            <div className="leave-empty-icon">
              📝
            </div>

            <h3>
              No Leave Requests Found
            </h3>

            <p>
              There are no leave requests to
              display.
            </p>

          </div>

        ) : (

          /* ==================================
             TABLE
          ================================== */

          <div className="leave-table-wrapper">

            <table className="leave-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredLeaves.map((leave) => {

                  const ownLeave = isOwnLeave(leave);

                  const showApproveReject =
                    canApproveLeave(leave);

                  const showDelete =
                    canDeleteLeave(leave);

                  const normalizedStatus =
                    leave.status?.toUpperCase() || "PENDING";

                  return (

                    <tr key={leave.id}>

                      {/* ID */}

                      <td>
                        {leave.id}
                      </td>

                      {/* EMPLOYEE ID */}

                      <td>
                        {leave.employeeId || "-"}
                      </td>

                      {/* EMPLOYEE NAME */}

                      <td>

                        <span className="employee-name">
                          {leave.employeeName || "N/A"}
                        </span>

                      </td>

                      {/* START DATE */}

                      <td>
                        {leave.startDate || "-"}
                      </td>

                      {/* END DATE */}

                      <td>
                        {leave.endDate || "-"}
                      </td>

                      {/* REASON */}

                      <td>

                        <span
                          className="leave-reason"
                          title={leave.reason}
                        >
                          {leave.reason || "-"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`leave-status ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {formatStatus(
                            leave.status
                          )}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="leave-actions">

                          {/* ==================================
                              APPROVE / REJECT
                          ================================== */}

                          {showApproveReject ? (

                            <>

                              {/* PENDING */}

                              {normalizedStatus ===
                                "PENDING" && (

                                <>

                                  <button
                                    type="button"
                                    className="leave-approve-btn"
                                    onClick={() =>
                                      handleApprove(
                                        leave.id
                                      )
                                    }
                                  >
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    className="leave-reject-btn"
                                    onClick={() =>
                                      handleReject(
                                        leave.id
                                      )
                                    }
                                  >
                                    Reject
                                  </button>

                                </>
                              )}

                              {/* APPROVED */}

                              {normalizedStatus ===
                                "APPROVED" && (

                                <span className="action-completed">
                                  Approved
                                </span>

                              )}

                              {/* REJECTED */}

                              {normalizedStatus ===
                                "REJECTED" && (

                                <span className="action-completed">
                                  Rejected
                                </span>

                              )}

                            </>

                          ) : (

                            <>
                              {/* Own leave for MANAGER / HR */}

                              {ownLeave &&
                                (userRole === "MANAGER" ||
                                  userRole === "HR") ? (

                                <span className="no-action">
                                  Your Leave
                                </span>

                              ) : (

                                <span className="no-action">
                                  -
                                </span>

                              )}
                            </>

                          )}

                          {/* ==================================
                              DELETE
                          ================================== */}

                          {showDelete && (

                            <button
                              type="button"
                              className="leave-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  leave.id
                                )
                              }
                            >
                              Delete
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>
        )}

        {/* ====================================
            TABLE FOOTER
        ==================================== */}

        {!loading &&
          !profileLoading &&
          filteredLeaves.length > 0 && (

          <div className="leave-table-footer">

            Showing{" "}

            <strong>
              {filteredLeaves.length}
            </strong>{" "}

            leave request
            {filteredLeaves.length !== 1
              ? "s"
              : ""}

          </div>

        )}

      </div>

    </div>
  );
}

export default Leave;