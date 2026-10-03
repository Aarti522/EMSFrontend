import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  return (
    <div className="ems-dashboard-layout">

      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="ems-dashboard-main">

        {/* TOP NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="ems-dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
