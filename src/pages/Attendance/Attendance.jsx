import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import {
  getAttendance,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByEmployeeId,
  getAttendanceByDate,
  checkIn,
  checkOut,
} from "../../services/attendanceService";


function Attendance() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // ========================================
  // STATE
  // ========================================

  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [error, setError] = useState("");

  const [myEmployeeId, setMyEmployeeId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "PRESENT",
  });

  // ========================================
  // LOAD LOGGED-IN USER PROFILE
  // ========================================

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

  // ========================================
  // LOAD ATTENDANCE ROLE-WISE
  // ========================================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      let data = [];

      if (userRole === "ADMIN" || userRole === "HR") {
        data = await getAttendance();
      } else if (userRole === "EMPLOYEE") {
        if (myEmployeeId !== null) {
          data = await getAttendanceByEmployeeId(myEmployeeId);
        }
      } else if (userRole === "MANAGER") {
        data = await getAttendance();
      }

      setAttendance(data || []);
    } catch (err) {
      console.error("Error loading attendance:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    const initializeAttendance = async () => {
      await loadMyProfile();
    };

    initializeAttendance();
  }, []);

  // ========================================
  // LOAD ATTENDANCE AFTER PROFILE
  // ========================================

  useEffect(() => {
    if (!profileLoading) {
      loadAttendance();
    }
  }, [profileLoading, myEmployeeId, userRole]);

  // ========================================
  // CHECK OWN ATTENDANCE
  // ========================================

  const isOwnAttendance = (record) => {
    return (
      myEmployeeId !== null &&
      Number(record.employeeId) === Number(myEmployeeId)
    );
  };

  // ========================================
  // SELF CHECK-IN
  // ========================================

  const handleCheckIn = async () => {
    try {
      setError("");

      const data = await checkIn();

      alert(
        `Check-in successful at ${
          data.checkIn || "current time"
        }`
      );

      await loadAttendance();
    } catch (err) {
      console.error("CHECK-IN ERROR:", err);

      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Check-in failed.";

      alert(message);
    }
  };

  // ========================================
  // SELF CHECK-OUT
  // ========================================

  const handleCheckOut = async () => {
    try {
      setError("");

      const data = await checkOut();

      alert(
        `Check-out successful at ${
          data.checkOut || "current time"
        }`
      );

      await loadAttendance();
    } catch (err) {
      console.error("CHECK-OUT ERROR:", err);

      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Check-out failed.";

      alert(message);
    }
  };

  // ========================================
  // FORM INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // ADD / UPDATE ATTENDANCE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const attendanceData = {
        employeeId: Number(formData.employeeId),
        date: formData.date,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        status: formData.status,
      };

      if (editingId) {
        await updateAttendance(
          editingId,
          attendanceData
        );

        alert("Attendance updated successfully.");
      } else {
        await addAttendance(attendanceData);

        alert("Attendance added successfully.");
      }

      resetForm();

      await loadAttendance();
    } catch (err) {
      console.error("Attendance save error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to save attendance."
      );
    }
  };

  // ========================================
  // EDIT ATTENDANCE
  // ========================================

  const handleEdit = (record) => {
    if (
      userRole === "HR" &&
      isOwnAttendance(record)
    ) {
      alert("You cannot edit your own attendance.");
      return;
    }

    setEditingId(record.id);

    setFormData({
      employeeId: record.employeeId || "",
      date: record.date || "",
      checkIn: record.checkIn || "",
      checkOut: record.checkOut || "",
      status: record.status || "PRESENT",
    });

    setShowForm(true);
  };

  // ========================================
  // DELETE ATTENDANCE
  // ========================================

  const handleDelete = async (id) => {
    const record = attendance.find(
      (item) => Number(item.id) === Number(id)
    );

    if (
      userRole === "HR" &&
      record &&
      isOwnAttendance(record)
    ) {
      alert("You cannot delete your own attendance.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAttendance(id);

      alert("Attendance deleted successfully.");

      await loadAttendance();
    } catch (err) {
      console.error("Delete attendance error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to delete attendance."
      );
    }
  };

  // ========================================
  // FILTER BY EMPLOYEE
  // ========================================

  const handleEmployeeFilter = async () => {
    if (!employeeIdFilter) {
      await loadAttendance();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await getAttendanceByEmployeeId(
          employeeIdFilter
        );

      setAttendance(data || []);
    } catch (err) {
      console.error("Employee filter error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to filter attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FILTER BY DATE
  // ========================================

  const handleDateFilter = async () => {
    if (!dateFilter) {
      await loadAttendance();
      return;
    }

    try {
      setLoading(true);
      setError("");

      let data = await getAttendanceByDate(
        dateFilter
      );

      if (userRole === "EMPLOYEE") {
        data = data.filter(
          (record) =>
            Number(record.employeeId) ===
            Number(myEmployeeId)
        );
      }

      setAttendance(data || []);
    } catch (err) {
      console.error("Date filter error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to filter attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: "",
      checkIn: "",
      checkOut: "",
      status: "PRESENT",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setEmployeeIdFilter("");
    setDateFilter("");

    loadAttendance();
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading || profileLoading) {
    return (
      <div className="attendance-page">
        <div className="attendance-loading">
          <div className="attendance-spinner"></div>

          <p>Loading attendance...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="attendance-page">

      {/* HEADER */}

      <div className="attendance-header">

        <div className="attendance-title-section">

          <div className="attendance-eyebrow">
            <span className="attendance-status-dot"></span>
            ATTENDANCE MANAGEMENT
          </div>

          <h2>Attendance</h2>

          <p>
            {userRole === "ADMIN" &&
              "Manage attendance across the organization"}

            {userRole === "HR" &&
              "Manage and track employee attendance"}

            {userRole === "MANAGER" &&
              "Track your team attendance"}

            {userRole === "EMPLOYEE" &&
              "View and manage your attendance"}
          </p>

        </div>

        <div className="attendance-header-actions">

          <button
            type="button"
            onClick={handleCheckIn}
            className="attendance-btn attendance-btn-success"
          >
            <span>✓</span>
            Check In
          </button>

          <button
            type="button"
            onClick={handleCheckOut}
            className="attendance-btn attendance-btn-warning"
          >
            <span>↗</span>
            Check Out
          </button>

          {(userRole === "ADMIN" ||
            userRole === "HR") && (

            <button
              type="button"
              onClick={() => {
                setEditingId(null);

                setFormData({
                  employeeId: "",
                  date: "",
                  checkIn: "",
                  checkOut: "",
                  status: "PRESENT",
                });

                setShowForm(true);
              }}
              className="attendance-btn attendance-btn-primary"
            >
              <span>+</span>
              Add Attendance
            </button>

          )}

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="attendance-alert">
          <div className="attendance-alert-icon">!</div>

          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* FILTERS */}

      <div className="attendance-filter-card">

        <div className="attendance-filter-heading">
          <div className="attendance-filter-icon">
            ⚙
          </div>

          <div>
            <h3>Filter Attendance</h3>
            <p>Search attendance records</p>
          </div>
        </div>

        <div className="attendance-filter-fields">

          {(userRole === "ADMIN" ||
            userRole === "HR") && (

            <div className="attendance-field">

              <label>Employee ID</label>

              <div className="attendance-input-action">

                <input
                  type="number"
                  value={employeeIdFilter}
                  onChange={(e) =>
                    setEmployeeIdFilter(
                      e.target.value
                    )
                  }
                  placeholder="Enter Employee ID"
                />

                <button
                  type="button"
                  onClick={handleEmployeeFilter}
                  className="attendance-search-btn"
                >
                  Search
                </button>

              </div>

            </div>

          )}

          <div className="attendance-field">

            <label>Date</label>

            <div className="attendance-input-action">

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={handleDateFilter}
                className="attendance-search-btn"
              >
                Search
              </button>

            </div>

          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="attendance-clear-btn"
          >
            Clear Filters
          </button>

        </div>

      </div>

      {/* ADD / EDIT FORM */}

      {showForm && (

        <div className="attendance-form-card">

          <div className="attendance-form-header">

            <div>
              <div className="attendance-form-label">
                ATTENDANCE RECORD
              </div>

              <h3>
                {editingId
                  ? "Edit Attendance"
                  : "Add Attendance"}
              </h3>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="attendance-close-btn"
            >
              ×
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="attendance-form-grid"
          >

            <div className="attendance-field">
              <label>Employee ID</label>

              <input
                type="number"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Employee ID"
                required
              />
            </div>

            <div className="attendance-field">
              <label>Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="attendance-field">
              <label>Check In</label>

              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
              />
            </div>

            <div className="attendance-field">
              <label>Check Out</label>

              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
              />
            </div>

            <div className="attendance-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="PRESENT">
                  PRESENT
                </option>

                <option value="ABSENT">
                  ABSENT
                </option>

                <option value="HALF_DAY">
                  HALF DAY
                </option>

                <option value="LEAVE">
                  LEAVE
                </option>
              </select>
            </div>

            <div className="attendance-form-actions">

              <button
                type="submit"
                className="attendance-btn attendance-btn-primary"
              >
                {editingId
                  ? "Update Attendance"
                  : "Save Attendance"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="attendance-btn attendance-btn-secondary"
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

      {/* TABLE */}

      <div className="attendance-table-card">

        <div className="attendance-table-header">

          <div>
            <h3>Attendance Records</h3>

            <p>
              {attendance.length} record
              {attendance.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="attendance-record-count">
            {attendance.length}
          </div>

        </div>

        <div className="attendance-table-wrapper">

          <table className="attendance-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>

                {(userRole === "ADMIN" ||
                  userRole === "HR") && (
                  <th>Actions</th>
                )}
              </tr>
            </thead>

            <tbody>

              {attendance.length === 0 ? (

                <tr>
                  <td
                    colSpan={
                      userRole === "ADMIN" ||
                      userRole === "HR"
                        ? 7
                        : 6
                    }
                  >
                    <div className="attendance-empty">
                      <div className="attendance-empty-icon">
                        📅
                      </div>

                      <strong>
                        No attendance records found
                      </strong>

                      <span>
                        Try changing your filters or add a new record.
                      </span>
                    </div>
                  </td>
                </tr>

              ) : (

                attendance.map((record) => (

                  <tr key={record.id}>

                    <td>
                      <span className="attendance-id">
                        #{record.id}
                      </span>
                    </td>

                    <td>
                      <span className="employee-id-badge">
                        EMP-{record.employeeId}
                      </span>
                    </td>

                    <td>
                      <span className="attendance-date">
                        {record.date}
                      </span>
                    </td>

                    <td>
                      <span className="time-value">
                        {record.checkIn || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="time-value">
                        {record.checkOut || "-"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`attendance-status attendance-status-${(
                          record.status || ""
                        )
                          .toLowerCase()
                          .replace("_", "-")}`}
                      >
                        {record.status || "-"}
                      </span>
                    </td>

                    {(userRole === "ADMIN" ||
                      userRole === "HR") && (

                      <td>

                        {userRole === "HR" &&
                        isOwnAttendance(record) ? (

                          <span className="own-attendance">
                            View Only
                          </span>

                        ) : (

                          <div className="attendance-action-group">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(record)
                              }
                              className="table-action table-action-edit"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(record.id)
                              }
                              className="table-action table-action-delete"
                            >
                              Delete
                            </button>

                          </div>

                        )}

                      </td>

                    )}

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Attendance;