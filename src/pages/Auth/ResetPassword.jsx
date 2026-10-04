import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import "../../styles/Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(
        email,
        otp,
        newPassword
      );

      console.log("Reset Password Response:", data);

      setSuccess(
        data.message || "Password reset successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Reset Password Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to reset password. Please try again."
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
              Create a new secure password and regain access
              to your AI-EMS account.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span>✓</span>
                <p>OTP Verification</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Secure Password Reset</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Protected Account</p>
              </div>
            </div>

          </div>

          <div className="auth-brand-footer">
            © 2026 AI-EMS. All rights reserved.
          </div>
        </div>

        {/* FORM */}
        <div className="auth-form-section">
          <div className="auth-form-card">

            <div className="auth-header">
              <div className="auth-header-icon">🔐</div>

              <h2>Reset Password</h2>

              <p>
                Enter the OTP and create your new password
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

            <form onSubmit={handleResetPassword}>

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
                    value={email}
                    readOnly
                  />
                </div>
              </div>

              {/* OTP */}
              <div className="auth-input-group">
                <label htmlFor="otp">
                  Verification OTP
                </label>

                <div className="auth-input-wrapper has-icon">
                  <span className="auth-input-icon">🔢</span>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    required
                    className="auth-otp-input"
                  />
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="auth-input-group">
                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="auth-input-wrapper has-icon">
                  <span className="auth-input-icon">🔒</span>

                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="auth-input-group">
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="auth-input-wrapper has-icon">
                  <span className="auth-input-icon">🔐</span>

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                  />
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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <span className="auth-button-arrow">→</span>
                  </>
                )}
              </button>

            </form>

            <div className="auth-security">
              <div className="auth-security-icon">🛡</div>

              <div className="auth-security-text">
                <strong>Secure Password Reset</strong>
                <span>
                  Your new password will be securely updated.
                </span>
              </div>
            </div>

            <div className="auth-bottom-text">
              Remember your password?{" "}
              <Link to="/login" className="auth-bottom-link">
                Back to Login
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;