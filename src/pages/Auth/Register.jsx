import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import "../../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;

      const data = await registerUser(registerData);

      console.log("Register Response:", data);

      setSuccess(data.message || "Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Register Error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT BRAND */}
        <div className="auth-brand">
          <div className="auth-brand-content">

            <div className="auth-brand-logo">
              <span>✦</span>
            </div>

            <h1>AI-EMS</h1>

            <p className="auth-brand-subtitle">
              Employee Management System
            </p>

            <p className="auth-brand-description">
              Create your account and start managing your
              employee information securely.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span>✓</span>
                <p>Easy Employee Management</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Attendance & Leave Tracking</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Payroll Management</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>AI-Powered Features</p>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © 2026 AI-EMS. All rights reserved.
          </div>
        </div>

        {/* FORM */}
        <div className="auth-form-section register-form-section">
          <div className="auth-form-card">

            <div className="auth-header">
              <div className="auth-header-icon">✨</div>

              <h2>Create Account</h2>

              <p>
                Register to access the AI-EMS platform
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert auth-alert-success">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleRegister}>

              <div className="auth-form-grid">

                {/* USERNAME */}
                <div className="auth-input-group">
                  <label htmlFor="username">
                    Username
                  </label>

                  <div className="auth-input-wrapper has-icon">
                    <span className="auth-input-icon">👤</span>

                    <input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* NAME */}
                <div className="auth-input-group">
                  <label htmlFor="name">
                    Full Name
                  </label>

                  <div className="auth-input-wrapper has-icon">
                    <span className="auth-input-icon">🧑</span>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="auth-input-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div className="auth-input-wrapper has-icon">
                    <span className="auth-input-icon">✉</span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="auth-input-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <div className="auth-input-wrapper has-icon">
                    <span className="auth-input-icon">📱</span>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="auth-input-group">
                  <label htmlFor="password">
                    Password
                  </label>

                  <div className="auth-input-wrapper has-icon">
                    <span className="auth-input-icon">🔒</span>

                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="auth-input-group">
                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>

                  <div className="auth-input-wrapper has-icon">
                    <span className="auth-input-icon">🔐</span>

                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* DEPARTMENT */}
                <div className="auth-input-group auth-full">
                  <label htmlFor="department">
                    Department
                  </label>

                  <div className="auth-input-wrapper">
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select Department
                      </option>

                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Software Development">
                        Software Development
                      </option>
                      <option value="Quality Assurance">
                        Quality Assurance
                      </option>
                      <option value="DevOps">DevOps</option>
                      <option value="Business Analyst">
                        Business Analyst
                      </option>
                      <option value="Administration">
                        Administration
                      </option>
                    </select>
                  </div>
                </div>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="auth-button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-bottom-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-bottom-link">
                Sign In
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;