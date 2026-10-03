import { useEffect, useState } from "react";
import {
    getMyProfile,
    updateMyProfile,
} from "../../services/profileService";
import "../../styles/profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // LOAD PROFILE
    // ==========================================

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyProfile();

            console.log("PROFILE DATA:", data);

            setProfile(data);

            setFormData({
                name: data?.name || "",
                phone: data?.phone || "",
                address: data?.address || "",
            });
        } catch (err) {
            console.error("Profile loading error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updatedProfile = await updateMyProfile(formData);

            setProfile(updatedProfile);

            setFormData({
                name: updatedProfile?.name || "",
                phone: updatedProfile?.phone || "",
                address: updatedProfile?.address || "",
            });

            setEditing(false);
            setSuccess("Profile updated successfully.");

            // Remove success message after a few seconds
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error("Profile update error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // CANCEL EDIT
    // ==========================================

    const handleCancel = () => {
        setFormData({
            name: profile?.name || "",
            phone: profile?.phone || "",
            address: profile?.address || "",
        });

        setEditing(false);
        setError("");
        setSuccess("");
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="profile-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-error">
                    <div className="error-icon">!</div>

                    <h3>Unable to Load Profile</h3>

                    <p>
                        {error || "Something went wrong."}
                    </p>

                    <button
                        type="button"
                        onClick={loadProfile}
                        className="retry-btn"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="profile-header">

                <div>
                    <h1>My Profile</h1>

                    <p>
                        Manage your personal information and
                        account details
                    </p>
                </div>

                {!editing && (
                    <button
                        type="button"
                        className="edit-profile-btn"
                        onClick={() => {
                            setEditing(true);
                            setError("");
                            setSuccess("");
                        }}
                    >
                        ✎ Edit Profile
                    </button>
                )}
            </div>


            {/* ==========================================
                ALERTS
            ========================================== */}

            {success && (
                <div className="profile-alert success-alert">
                    <span>✓</span>
                    {success}
                </div>
            )}

            {error && (
                <div className="profile-alert error-alert">
                    <span>!</span>
                    {error}
                </div>
            )}


            {/* ==========================================
                PROFILE OVERVIEW
            ========================================== */}

            <div className="profile-layout">

                {/* LEFT PROFILE CARD */}

                <div className="profile-card profile-overview">

                    <div className="profile-avatar">
                        {profile.name
                            ? profile.name.charAt(0).toUpperCase()
                            : "U"}
                    </div>

                    <h2>
                        {profile.name || "User"}
                    </h2>

                    <p className="profile-designation">
                        {profile.designation || "Employee"}
                    </p>

                    <div className="role-badge">
                        {profile.role || "USER"}
                    </div>

                    <div className="profile-status">
                        <span className="status-dot"></span>

                        {profile.status || "ACTIVE"}
                    </div>

                    <div className="overview-divider"></div>

                    <div className="overview-item">
                        <span className="overview-label">
                            Employee ID
                        </span>

                        <strong>
                            {profile.employeeId ?? "N/A"}
                        </strong>
                    </div>

                    <div className="overview-item">
                        <span className="overview-label">
                            Department
                        </span>

                        <strong>
                            {profile.department || "N/A"}
                        </strong>
                    </div>

                    <div className="overview-item">
                        <span className="overview-label">
                            Account Role
                        </span>

                        <strong>
                            {profile.role || "N/A"}
                        </strong>
                    </div>
                </div>


                {/* RIGHT DETAILS */}

                <div className="profile-card profile-details">

                    <div className="section-heading">
                        <div>
                            <h2>Personal Information</h2>

                            <p>
                                Your basic employee information
                            </p>
                        </div>
                    </div>


                    <form onSubmit={handleSave}>

                        <div className="profile-grid">

                            {/* NAME */}

                            <div className="profile-field">
                                <label htmlFor="name">
                                    Full Name
                                </label>

                                {editing ? (
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                ) : (
                                    <div className="field-value">
                                        {profile.name || "N/A"}
                                    </div>
                                )}
                            </div>


                            {/* EMAIL */}

                            <div className="profile-field">
                                <label>
                                    Email Address
                                </label>

                                <div className="field-value readonly">
                                    {profile.email || "N/A"}

                                    <span className="readonly-tag">
                                        Read Only
                                    </span>
                                </div>
                            </div>


                            {/* PHONE */}

                            <div className="profile-field">
                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                {editing ? (
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="field-value">
                                        {profile.phone || "N/A"}
                                    </div>
                                )}
                            </div>


                            {/* DESIGNATION */}

                            <div className="profile-field">
                                <label>
                                    Designation
                                </label>

                                <div className="field-value readonly">
                                    {profile.designation || "N/A"}

                                    <span className="readonly-tag">
                                        Read Only
                                    </span>
                                </div>
                            </div>


                            {/* DEPARTMENT */}

                            <div className="profile-field">
                                <label>
                                    Department
                                </label>

                                <div className="field-value readonly">
                                    {profile.department || "N/A"}

                                    <span className="readonly-tag">
                                        Read Only
                                    </span>
                                </div>
                            </div>


                            {/* SALARY */}

                            <div className="profile-field">
                                <label>
                                    Salary
                                </label>

                                <div className="field-value readonly salary-value">
                                    ₹
                                    {profile.salary != null
                                        ? Number(
                                            profile.salary
                                        ).toLocaleString("en-IN")
                                        : "N/A"}

                                    <span className="readonly-tag">
                                        Read Only
                                    </span>
                                </div>
                            </div>


                            {/* ADDRESS */}

                            <div className="profile-field full-width">
                                <label htmlFor="address">
                                    Address
                                </label>

                                {editing ? (
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your address"
                                        rows="4"
                                    />
                                ) : (
                                    <div className="field-value address-value">
                                        {profile.address || "N/A"}
                                    </div>
                                )}
                            </div>

                        </div>


                        {/* ==========================================
                            FORM ACTIONS
                        ========================================== */}

                        {editing && (
                            <div className="profile-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>
                        )}

                    </form>
                </div>
            </div>


            {/* ==========================================
                ACCOUNT INFORMATION
            ========================================== */}

            <div className="profile-card account-card">

                <div className="section-heading">
                    <div>
                        <h2>Account Information</h2>

                        <p>
                            System-generated account details
                        </p>
                    </div>
                </div>

                <div className="account-grid">

                    <div className="account-item">
                        <span>Account ID</span>
                        <strong>
                            {profile.userId ?? "N/A"}
                        </strong>
                    </div>

                    <div className="account-item">
                        <span>Employee ID</span>
                        <strong>
                            {profile.employeeId ?? "N/A"}
                        </strong>
                    </div>

                    <div className="account-item">
                        <span>Role</span>
                        <strong>
                            {profile.role || "N/A"}
                        </strong>
                    </div>

                    <div className="account-item">
                        <span>First Login</span>
                        <strong>
                            {profile.firstLogin
                                ? "Yes"
                                : "Completed"}
                        </strong>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Profile;
