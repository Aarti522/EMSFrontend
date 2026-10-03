import { useEffect, useState } from "react";
import "../../styles/reports.css";

import { getAnalytics } from "../../services/reportService";

function Reports() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    // =========================================================
    // LOAD LIVE REPORT DATA
    // =========================================================
    const loadReports = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getAnalytics();

            setAnalytics(data);
        } catch (err) {
            console.error("Error loading reports:", err);

            if (err.response?.status === 401) {
                setError("Session expired. Please login again.");
            } else if (err.response?.status === 403) {
                setError("You do not have permission to view reports.");
            } else {
                setError("Unable to load reports. Please try again.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // =========================================================
    // LOADING
    // =========================================================
    if (loading) {
        return (
            <div className="reports-page">
                <div className="reports-loading">
                    <div className="loading-spinner"></div>
                    <h3>Loading Reports...</h3>
                    <p>Fetching latest organization data</p>
                </div>
            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================
    if (error) {
        return (
            <div className="reports-page">
                <div className="reports-error">
                    <div className="error-icon">!</div>

                    <h3>Unable to Load Reports</h3>

                    <p>{error}</p>

                    <button
                        className="retry-btn"
                        onClick={() => loadReports()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    if (!analytics) {
        return null;
    }


    // =========================================================
    // ROLE
    // =========================================================
    const role = analytics.role || "USER";

    const isAdmin = role === "ADMIN";
    const isHR = role === "HR";
    const isManager = role === "MANAGER";
    const isEmployee = role === "EMPLOYEE";


    // =========================================================
    // PAGE TITLE
    // =========================================================
    let overviewTitle = "Overview";

    if (isAdmin) {
        overviewTitle = "Organization Overview";
    } else if (isHR) {
        overviewTitle = "HR Overview";
    } else if (isManager) {
        overviewTitle = "Team Overview";
    } else if (isEmployee) {
        overviewTitle = "My Overview";
    }


    // =========================================================
    // DATE
    // =========================================================
    const reportDate = analytics.date
        ? new Date(`${analytics.date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        )
        : new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });


    // =========================================================
    // SAFE VALUES
    // =========================================================
    const totalEmployees = analytics.totalEmployees || 0;

    const presentToday = analytics.presentToday || 0;
    const absentToday = analytics.absentToday || 0;
    const halfDayToday = analytics.halfDayToday || 0;
    const leaveToday = analytics.leaveToday || 0;

    const todayAttendance = analytics.todayAttendance || 0;

    const pendingLeaves = analytics.pendingLeaves || 0;
    const approvedLeaves = analytics.approvedLeaves || 0;
    const rejectedLeaves = analytics.rejectedLeaves || 0;

    const totalAttendanceRecords =
        analytics.totalAttendanceRecords || 0;

    const totalLeaveRecords =
        analytics.totalLeaveRecords || 0;

    const totalSalaryRecords =
        analytics.totalSalaryRecords || 0;

    const totalDepartments =
        analytics.totalDepartments || 0;


    // =========================================================
    // ATTENDANCE PERCENTAGE
    // =========================================================
    const attendancePercentage =
        totalEmployees > 0
            ? Math.round((presentToday / totalEmployees) * 100)
            : 0;


    return (
        <div className="reports-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div className="reports-header">

                <div className="reports-header-left">

                    <div className="reports-title-icon">
                        📊
                    </div>

                    <div>
                        <h1>Reports Dashboard</h1>

                        <p>
                            {overviewTitle} · Real-time business insights
                        </p>
                    </div>

                </div>


                <div className="reports-header-right">

                    <div className="report-date">
                        <span className="date-label">
                            Report Date
                        </span>

                        <span className="date-value">
                            {reportDate}
                        </span>
                    </div>


                    <button
                        className={`refresh-btn ${
                            refreshing ? "refreshing" : ""
                        }`}
                        onClick={() => loadReports(true)}
                        disabled={refreshing}
                    >
                        <span className="refresh-icon">
                            ↻
                        </span>

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>

            </div>


            {/* =================================================
                ROLE / DEPARTMENT INFO
            ================================================= */}
            <div className="report-context">

                <div className="context-left">

                    <span className="context-dot"></span>

                    <span>
                        {isAdmin && "Administrator Dashboard"}

                        {isHR && "Human Resources Dashboard"}

                        {isManager &&
                            `Manager Dashboard${
                                analytics.department
                                    ? ` · ${analytics.department}`
                                    : ""
                            }`
                        }

                        {isEmployee &&
                            "Employee Personal Dashboard"}
                    </span>

                </div>


                <span className="live-status">
                    <span className="live-dot"></span>
                    Live Data
                </span>

            </div>


            {/* =================================================
                KPI CARDS
            ================================================= */}
            <section className="reports-section">

                <div className="section-heading">

                    <div>
                        <h2>Key Performance Indicators</h2>

                        <p>
                            Important statistics at a glance
                        </p>
                    </div>

                </div>


                <div className="kpi-grid">

                    {/* TOTAL EMPLOYEES */}
                    <div className="kpi-card">

                        <div className="kpi-top">

                            <div className="kpi-icon employees-icon">
                                👥
                            </div>

                            <span className="kpi-label">
                                {isEmployee
                                    ? "My Profile"
                                    : isManager
                                    ? "Team Employees"
                                    : "Total Employees"}
                            </span>

                        </div>

                        <div className="kpi-value">
                            {totalEmployees}
                        </div>

                        <div className="kpi-footer">
                            {isEmployee
                                ? "Your employee profile"
                                : isManager
                                ? "Employees in your team"
                                : "Active organization workforce"}
                        </div>

                    </div>


                    {/* PRESENT TODAY */}
                    <div className="kpi-card">

                        <div className="kpi-top">

                            <div className="kpi-icon present-icon">
                                ✓
                            </div>

                            <span className="kpi-label">
                                Present Today
                            </span>

                        </div>

                        <div className="kpi-value">
                            {presentToday}
                        </div>

                        <div className="kpi-footer success-text">
                            {attendancePercentage}% attendance
                        </div>

                    </div>


                    {/* ABSENT TODAY */}
                    <div className="kpi-card">

                        <div className="kpi-top">

                            <div className="kpi-icon absent-icon">
                                ×
                            </div>

                            <span className="kpi-label">
                                Absent Today
                            </span>

                        </div>

                        <div className="kpi-value">
                            {absentToday}
                        </div>

                        <div className="kpi-footer">
                            Today's absence records
                        </div>

                    </div>


                    {/* PENDING LEAVES */}
                    <div className="kpi-card">

                        <div className="kpi-top">

                            <div className="kpi-icon pending-icon">
                                ⏳
                            </div>

                            <span className="kpi-label">
                                Pending Leaves
                            </span>

                        </div>

                        <div className="kpi-value">
                            {pendingLeaves}
                        </div>

                        <div className="kpi-footer">
                            Awaiting approval
                        </div>

                    </div>


                    {/* APPROVED LEAVES */}
                    <div className="kpi-card">

                        <div className="kpi-top">

                            <div className="kpi-icon approved-icon">
                                ✓
                            </div>

                            <span className="kpi-label">
                                Approved Leaves
                            </span>

                        </div>

                        <div className="kpi-value">
                            {approvedLeaves}
                        </div>

                        <div className="kpi-footer">
                            Approved leave requests
                        </div>

                    </div>


                    {/* SALARY RECORDS */}
                    <div className="kpi-card">

                        <div className="kpi-top">

                            <div className="kpi-icon payroll-icon">
                                ₹
                            </div>

                            <span className="kpi-label">
                                Payroll Records
                            </span>

                        </div>

                        <div className="kpi-value">
                            {totalSalaryRecords}
                        </div>

                        <div className="kpi-footer">
                            Salary records available
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                MAIN REPORT GRID
            ================================================= */}
            <div className="reports-main-grid">


                {/* =================================================
                    ATTENDANCE OVERVIEW
                ================================================= */}
                <section className="report-panel attendance-panel">

                    <div className="panel-header">

                        <div>

                            <h2>Attendance Overview</h2>

                            <p>
                                Today's attendance status
                            </p>

                        </div>

                        <div className="panel-icon">
                            🕒
                        </div>

                    </div>


                    <div className="attendance-summary">

                        <div className="attendance-total">

                            <span className="attendance-number">
                                {todayAttendance}
                            </span>

                            <span className="attendance-label">
                                Today's Records
                            </span>

                        </div>


                        <div className="attendance-progress">

                            <div className="progress-header">

                                <span>
                                    Present Rate
                                </span>

                                <strong>
                                    {attendancePercentage}%
                                </strong>

                            </div>

                            <div className="progress-bar">

                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(
                                            attendancePercentage,
                                            100
                                        )}%`,
                                    }}
                                ></div>

                            </div>

                        </div>

                    </div>


                    <div className="status-list">

                        <div className="status-row">

                            <div className="status-name">

                                <span className="status-dot present-dot"></span>

                                <span>Present</span>

                            </div>

                            <strong>{presentToday}</strong>

                        </div>


                        <div className="status-row">

                            <div className="status-name">

                                <span className="status-dot absent-dot"></span>

                                <span>Absent</span>

                            </div>

                            <strong>{absentToday}</strong>

                        </div>


                        <div className="status-row">

                            <div className="status-name">

                                <span className="status-dot halfday-dot"></span>

                                <span>Half Day</span>

                            </div>

                            <strong>{halfDayToday}</strong>

                        </div>


                        <div className="status-row">

                            <div className="status-name">

                                <span className="status-dot leave-dot"></span>

                                <span>On Leave</span>

                            </div>

                            <strong>{leaveToday}</strong>

                        </div>

                    </div>

                </section>



                {/* =================================================
                    LEAVE OVERVIEW
                ================================================= */}
                <section className="report-panel leave-panel">

                    <div className="panel-header">

                        <div>

                            <h2>Leave Overview</h2>

                            <p>
                                Leave request status
                            </p>

                        </div>

                        <div className="panel-icon">
                            📅
                        </div>

                    </div>


                    <div className="leave-stats">

                        <div className="leave-stat">

                            <div className="leave-stat-icon pending-leave">
                                ⏳
                            </div>

                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {pendingLeaves}
                                </strong>

                            </div>

                        </div>


                        <div className="leave-stat">

                            <div className="leave-stat-icon approved-leave">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Approved
                                </span>

                                <strong>
                                    {approvedLeaves}
                                </strong>

                            </div>

                        </div>


                        <div className="leave-stat">

                            <div className="leave-stat-icon rejected-leave">
                                ×
                            </div>

                            <div>

                                <span>
                                    Rejected
                                </span>

                                <strong>
                                    {rejectedLeaves}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="leave-total">

                        <div>

                            <span>
                                Total Leave Requests
                            </span>

                            <strong>
                                {totalLeaveRecords}
                            </strong>

                        </div>

                        <span className="view-label">
                            All records
                        </span>

                    </div>

                </section>

            </div>


            {/* =================================================
                SYSTEM SUMMARY
            ================================================= */}
            <section className="report-panel system-panel">

                <div className="panel-header">

                    <div>

                        <h2>System Summary</h2>

                        <p>
                            Overall module statistics
                        </p>

                    </div>

                    <div className="panel-icon">
                        📈
                    </div>

                </div>


                <div className="system-grid">

                    {/* EMPLOYEES */}
                    <div className="system-item">

                        <div className="system-item-icon">
                            👥
                        </div>

                        <div>

                            <span>
                                Employees
                            </span>

                            <strong>
                                {totalEmployees}
                            </strong>

                        </div>

                    </div>


                    {/* DEPARTMENTS */}
                    <div className="system-item">

                        <div className="system-item-icon">
                            🏢
                        </div>

                        <div>

                            <span>
                                Departments
                            </span>

                            <strong>
                                {totalDepartments}
                            </strong>

                        </div>

                    </div>


                    {/* ATTENDANCE */}
                    <div className="system-item">

                        <div className="system-item-icon">
                            🕒
                        </div>

                        <div>

                            <span>
                                Attendance Records
                            </span>

                            <strong>
                                {totalAttendanceRecords}
                            </strong>

                        </div>

                    </div>


                    {/* LEAVES */}
                    <div className="system-item">

                        <div className="system-item-icon">
                            📅
                        </div>

                        <div>

                            <span>
                                Leave Records
                            </span>

                            <strong>
                                {totalLeaveRecords}
                            </strong>

                        </div>

                    </div>


                    {/* PAYROLL */}
                    <div className="system-item">

                        <div className="system-item-icon">
                            ₹
                        </div>

                        <div>

                            <span>
                                Payroll Records
                            </span>

                            <strong>
                                {totalSalaryRecords}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                REPORT FOOTER
            ================================================= */}
            <div className="reports-footer">

                <div>
                    <span className="footer-live-dot"></span>

                    Reports are generated from live database data.
                </div>

                <span>
                    Last viewed: {reportDate}
                </span>

            </div>

        </div>
    );
}

export default Reports;
