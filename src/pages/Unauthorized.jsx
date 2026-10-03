import { Link } from "react-router-dom";

function Unauthorized() {

  return (
    <div>
      <h1>403</h1>

      <h2>Unauthorized Access</h2>

      <p>
        You don't have permission to access this page.
      </p>

      <Link to="/dashboard">
        Go to Dashboard
      </Link>
    </div>
  );
}

export default Unauthorized;