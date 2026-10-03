import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      console.log("Login Response:", data);

      if (!data.token) {
        setError(data.message || "Login failed");
        return;
      }

      login(data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      setError(
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT BRAND SECTION */}
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
              Smart employee management powered by modern technology
              and artificial intelligence.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span>✓</span>
                <p>Employee Management</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Attendance & Payroll</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>AI-Powered Insights</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Secure Role-Based Access</p>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © 2026 AI-EMS. All rights reserved.
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="auth-form-section">
          <div className="auth-form-card">

            <div className="auth-header">
              <div className="auth-header-icon">👋</div>

              <h2>Welcome Back!</h2>

              <p>
                Sign in to continue to your AI-EMS account
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="auth-input-group">
                <label htmlFor="email">Email Address</label>

                <div className="auth-input-wrapper has-icon">
                  <span className="auth-input-icon">✉</span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  <Link
                    to="/forgot-password"
                    className="auth-forgot-link"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="auth-input-wrapper has-icon">
                  <span className="auth-input-icon">🔒</span>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="auth-button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* SECURITY */}
            <div className="auth-security">
              <div className="auth-security-icon">🔐</div>

              <div className="auth-security-text">
                <strong>Secure Login</strong>
                <span>Your account is protected with JWT authentication.</span>
              </div>
            </div>

            {/* REGISTER */}
            <div className="auth-bottom-text">
              Don't have an account?{" "}
              <Link to="/register" className="auth-bottom-link">
                Create Account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;