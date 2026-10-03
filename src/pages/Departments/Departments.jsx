import { useEffect, useMemo, useState } from "react";
import "../../styles/departments.css";

import {
  getAllDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";

import { useAuth } from "../../context/AuthContext";

function Departments() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // Only ADMIN can manage departments
  const canManageDepartments = userRole === "ADMIN";

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllDepartments();

      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading departments:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view departments.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load departments."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // =========================================================
  // CLEAR MESSAGES
  // =========================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    if (!canManageDepartments) return;

    clearMessages();

    setEditingDepartment(null);

    setFormData({
      name: "",
      description: "",
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (department) => {
    if (!canManageDepartments) return;

    clearMessages();

    setEditingDepartment(department);

    setFormData({
      name: department.name || "",
      description: department.description || "",
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingDepartment(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  const validateForm = () => {
    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Department name is required.");
      return false;
    }

    if (name.length < 2) {
      setError("Department name must contain at least 2 characters.");
      return false;
    }

    if (name.length > 100) {
      setError("Department name cannot exceed 100 characters.");
      return false;
    }

    if (description.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return false;
    }

    return true;
  };

  // =========================================================
  // ADD / UPDATE DEPARTMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManageDepartments) return;

    clearMessages();

    if (!validateForm()) {
      return;
    }

    const departmentData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    try {
      setSaving(true);

      if (editingDepartment) {
        await updateDepartment(
          editingDepartment.id,
          departmentData
        );

        setSuccess("Department updated successfully.");
      } else {
        await addDepartment(departmentData);

        setSuccess("Department added successfully.");
      }

      closeModal();

      await loadDepartments();
    } catch (err) {
      console.error("Error saving department:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to perform this operation."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to save department."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE DEPARTMENT
  // =========================================================

  const handleDelete = async (department) => {
    if (!canManageDepartments) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      setDeletingId(department.id);

      await deleteDepartment(department.id);

      setSuccess("Department deleted successfully.");

      await loadDepartments();
    } catch (err) {
      console.error("Error deleting department:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to delete departments."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to delete department."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredDepartments = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return departments;
    }

    return departments.filter((department) => {
      const name = department.name?.toLowerCase() || "";
      const description =
        department.description?.toLowerCase() || "";

      return (
        name.includes(searchText) ||
        description.includes(searchText)
      );
    });
  }, [departments, search]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="departments-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <div>
          <h1>Departments</h1>

          <p>
            {userRole === "ADMIN"
              ? "Manage all departments in the organization."
              : userRole === "HR"
              ? "View all organization departments."
              : "View your assigned department."}
          </p>
        </div>

        {canManageDepartments && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            + Add Department
          </button>
        )}
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="department-toolbar">
        <input
          type="text"
          className="form-control"
          placeholder="Search department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setSearch("");
            loadDepartments();
          }}
        >
          Refresh
        </button>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="loading-state">
          <p>Loading departments...</p>
        </div>
      ) : (
        <>
          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="department-summary">
            <span>
              Total Departments:{" "}
              <strong>{departments.length}</strong>
            </span>

            {search && (
              <span>
                Showing:{" "}
                <strong>
                  {filteredDepartments.length}
                </strong>
              </span>
            )}
          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredDepartments.length === 0 ? (
            <div className="empty-state">
              <h3>No departments found</h3>

              <p>
                {search
                  ? "Try changing your search."
                  : "No departments are available."}
              </p>

              {canManageDepartments && !search && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openAddModal}
                >
                  + Add Department
                </button>
              )}
            </div>
          ) : (
            /* ================================================
               DEPARTMENT TABLE
               ================================================ */

            <div className="table-responsive">
              <table className="table departments-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Department Name</th>
                    <th>Description</th>

                    {canManageDepartments && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map((department) => (
                    <tr key={department.id}>

                      <td>
                        {department.id}
                      </td>

                      <td>
                        <strong>
                          {department.name || "N/A"}
                        </strong>
                      </td>

                      <td>
                        {department.description || "No description"}
                      </td>

                      {canManageDepartments && (
                        <td>
                          <div className="action-buttons">

                            <button
                              type="button"
                              className="btn btn-sm btn-warning"
                              onClick={() =>
                                openEditModal(department)
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDelete(department)
                              }
                              disabled={
                                deletingId === department.id
                              }
                            >
                              {deletingId === department.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        </td>
                      )}

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && canManageDepartments && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeModal();
            }
          }}
        >

          <div className="department-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>
                  {editingDepartment
                    ? "Update department information."
                    : "Create a new department."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Department Name */}

              <div className="form-group">
                <label htmlFor="department-name">
                  Department Name
                </label>

                <input
                  id="department-name"
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter department name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  disabled={saving}
                  required
                />
              </div>

              {/* Description */}

              <div className="form-group">
                <label htmlFor="department-description">
                  Description
                </label>

                <textarea
                  id="department-description"
                  name="description"
                  className="form-control"
                  placeholder="Enter department description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  disabled={saving}
                />
              </div>

              {/* Character count */}

              <div className="character-count">
                {formData.description.length}/500
              </div>

              {/* Modal Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? editingDepartment
                      ? "Updating..."
                      : "Adding..."
                    : editingDepartment
                    ? "Update Department"
                    : "Add Department"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Departments;