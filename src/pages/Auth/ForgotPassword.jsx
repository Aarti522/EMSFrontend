import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendForgotPasswordOtp } from "../../services/authService";
import "../../styles/auth.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await sendForgotPasswordOtp(email);

      console.log("Forgot Password Response:", data);

      setSuccess(
        data.message || "OTP sent successfully to your email."
      );

      setTimeout(() => {
        navigate("/reset-password", {
          state: { email },
        });
      }, 1000);
    } catch (error) {
      console.error("Forgot Password Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
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
              Reset your account password securely using
              email OTP verification.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span>✓</span>
                <p>Secure OTP Verification</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Email Based Password Reset</p>
              </div>

              <div className="auth-feature-item">
                <span>✓</span>
                <p>Protected Account Access</p>
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
              <div className="auth-header-icon">🔑</div>

              <h2>Forgot Password?</h2>

              <p>
                Enter your registered email to receive an OTP
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

            <form onSubmit={handleForgotPassword}>

              <div className="auth-input-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="auth-input-wrapper has-icon">
                  <span className="auth-input-icon">✉</span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <span className="auth-button-arrow">→</span>
                  </>
                )}
              </button>

            </form>

            <div className="auth-security">
              <div className="auth-security-icon">🔐</div>

              <div className="auth-security-text">
                <strong>Account Security</strong>
                <span>
                  A verification OTP will be sent to your registered email.
                </span>
              </div>
            </div>

            <div className="auth-bottom-text">
              Remember your password?{" "}
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

export default ForgotPassword;