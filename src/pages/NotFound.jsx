
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">

        <div className="not-found-icon">
          ⚠
        </div>

        <div className="not-found-code">
          404
        </div>

        <h1>Page Not Found</h1>

        <p>
          The page you are looking for does not exist or may have
          been moved to another location.
        </p>

        <Link to="/dashboard" className="not-found-btn">
          <span>←</span>
          Back to Dashboard
        </Link>

        <div className="not-found-footer">
          <span className="not-found-dot"></span>
          AI-EMS • Employee Management System
        </div>

      </div>
    </div>
  );
}

export default NotFound;