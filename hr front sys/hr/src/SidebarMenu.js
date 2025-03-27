import React, { useState } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import './SidebarMenu.css';
import {
  Home,
  Building,
  Users,
  ClipboardList,
  Calendar,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Folder,
} from "lucide-react";

const SidebarMenu = ({ handleLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogoutClick = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await api.post("/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear data after logout
      localStorage.removeItem("authToken");
      localStorage.removeItem("company");

      // Redirect to login page
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const sidebarStyle = {
    transition: "all 0.3s ease",
    width: collapsed ? "4rem" : "16rem", // 4rem for collapsed and 16rem for expanded
  };

  return (
    <div className="p-3 text-white shadow-lg min-vh-100 bg-primary" style={{ ...sidebarStyle, height: "auto" }}>
      {/* Header and Collapse Button */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        {!collapsed && <h2 className="text-white fs-4 fw-bold">HR System</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 btn btn-white rounded-circle"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Main Menu */}
      <nav>
        {/* General Management */}
        <SidebarItem
          icon={<Home size={20} />}
          text="Home"
          collapsed={collapsed}
          onClick={() => navigate("/home")}
          color="text-white"
        />

        {/* Company Management */}
        <SidebarDropdown
          icon={<Building size={20} />}
          text="Company"
          collapsed={collapsed}
          links={[
            { path: "/company-settings", label: "Company Settings" },
          ]}
        />

        {/* HR Management */}
        <SidebarDropdown
          icon={<Users size={20} />}
          text="HR Management"
          collapsed={collapsed}
          links={[
            { path: "/users", label: "Users" },
            { path: "/users/create", label: "Create User" },
            { path: "/role", label: "Roles" },
          ]}
        />

        {/* Evaluations Management */}
        <SidebarDropdown
          icon={<ClipboardList size={20} />}
          text="Evaluations"
          collapsed={collapsed}
          links={[
            { path: "/Evaluations", label: "Evaluations" },
            { path: "/Evaluation", label: "New Evaluations" },
          ]}
        />

        {/* Permissions Management */}
        <SidebarDropdown
          icon={<Folder size={20} />}
          text="Permissions"
          collapsed={collapsed}
          links={[
            { path: "/DepartmentAdmin", label: "Department Admins" },
            { path: "/PermissionManagement", label: "Permission Management" },
            { path: "/Permission", label: "Permissions" },
          ]}
        />

        {/* Attendance Management */}
        <SidebarDropdown
          icon={<ClipboardList size={20} />}
          text="Attendance"
          collapsed={collapsed}
          links={[
            { path: "/checkins", label: "Check-ins" },
            { path: "/CheckInSummaryChart", label: "Check-ins Chart" },
            { path: "/missingcheckouts", label: "Missing Checkouts" },
            { path: "/checkins/summary", label: "View Summary" },
            { path: "/checkins/summary-dep", label: "Departments Summary" },
            { path: "/MonthlyAttendance", label: "Monthly Attendance" },
            { path: "/salary", label: "Salary" },
          ]}
        />

        {/* Leave Management */}
        <SidebarDropdown
          icon={<Calendar size={20} />}
          text="Leave Management"
          collapsed={collapsed}
          links={[
            { path: "/leave", label: "Leave Requests" },
            { path: "/leave_types", label: "Leave Types" },
          ]}
        />

        {/* Departments Management */}
        <SidebarDropdown
          icon={<Folder size={20} />}
          text="Departments"
          collapsed={collapsed}
          links={[
            { path: "/departments/", label: "Departments" },
            { path: "/departments/add", label: "Add Department" },
          ]}
        />

        {/* Logout */}
        <SidebarItem
          icon={<LogOut size={20} />}
          text="Logout"
          collapsed={collapsed}
          onClick={handleLogoutClick}
          color="text-danger"
        />
      </nav>
    </div>
  );
};

// Single Item Component
const SidebarItem = ({ icon, text, collapsed, onClick, color = "text-white" }) => (
  <div
    onClick={onClick}
    className={`d-flex align-items-center gap-2 p-2 rounded ${color}`}
    style={{ cursor: "pointer" }}
  >
    {icon}
    {!collapsed && <span className="text-white fw-bold">{text}</span>}
  </div>
);

// Dropdown Component
const SidebarDropdown = ({ icon, text, collapsed, links }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Dropdown Header */}
      <div
        className="gap-2 p-2 text-white rounded d-flex align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        {icon}
        {!collapsed && <span className="text-white fw-bold">{text}</span>}
      </div>

      {/* Dropdown Links */}
      {!collapsed && open && (
        <div className="border-white ms-3 border-start ps-2">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="py-1 text-white d-block text-decoration-none"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarMenu;