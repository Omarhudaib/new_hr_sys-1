import React, { useState } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import './SidebarMenu.css'
import {
  Home,
  Building,
  Users,
  ClipboardList,
  Calendar,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Folder, // أيقونة جديدة للأقسام
} from "lucide-react";



  const SidebarMenu = ({ handleLogout }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
  
    const handleLogoutClick = async () => {
      try {
        const token = localStorage.getItem("authToken");
        await api.post("/logout", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // مسح البيانات بعد تسجيل الخروج
        localStorage.removeItem("authToken");
        localStorage.removeItem("company");
  
        // توجيه المستخدم إلى صفحة تسجيل الدخول
        navigate("/");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

  const sidebarStyle = {
    transition: "all 0.3s ease",
    width: collapsed ? "4rem" : "16rem", // 4rem للمُصغر و16rem للممتد
  };

  return (
   <div className="p-3 text-white shadow-lg min-vh-100 bg-primary " style={{ ...sidebarStyle, height: "auto" }}>

      {/* زر التوسيع والتصغير والعنوان */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        {!collapsed && <h2 className="text-white fs-4 fw-bold">HR System</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 btn btn-white rounded-circle"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* القائمة */}
      <nav>
        <SidebarItem
          icon={<Home size={20} />}
          text="Home"
          collapsed={collapsed}
          onClick={() => navigate("/home")}
          color="text-white"
        />
        <SidebarDropdown
          icon={<Building size={20} />}
          text="Company"
          collapsed={collapsed}
          links={[
            { path: "/company-settings", label: " Company Settings" },
       // { path: "/attendance-reports", label: " Company Reports" },//
          ]}
        />
        <SidebarDropdown
          icon={<Users size={20} />}
          text="HR Management"
          collapsed={collapsed}
          links={[
            { path: "/users", label: " Users" },
            { path: "/users/create", label: " Create User" },
            { path: "/role", label: " Roles" },
          ]}
        />
        <SidebarDropdown
          icon={<ClipboardList size={20} />}
          text="Attendance"
          collapsed={collapsed}
          links={[
            { path: "/checkins", label: " Check-ins" },
                      { path: "/CheckInSummaryChart", label: " Check-ins Chart" },
            { path: "/missingcheckouts", label: " Missing Checkouts" },
            { path: "/checkins/summary", label: " View Summary" },
            { path: "/checkins/summary-dep", label: " Departments Summary" },
            { path: "/MonthlyAttendance", label: " Monthly Attendance" },
            { path: "/salary", label: " Salary" },
          ]}
        />
        <SidebarDropdown
          icon={<Calendar size={20} />}
          text="Leave Management"
          collapsed={collapsed}
          links={[
            { path: "/leave", label: " Leave Request" },
            { path: "/leave_types", label: " Leave Types" },
          ]}
        />
        {/* قسم Departments الجديد */}
        <SidebarDropdown
          icon={<Folder size={20} />}
          text="Departments"
          collapsed={collapsed}
          links={[
            { path: "/departments/", label: " Departments" },
            { path: "/departments/add", label: " Add Department" },
          ]}
        />
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

const SidebarItem = ({
  icon,
  text,
  collapsed,
  onClick,
  color = "text-white",
}) => (
  <div
    onClick={onClick}
    className={`d-flex align-items-center gap-2 p-2 rounded ${color}`}
    style={{ cursor: "pointer" }}
  >
    {icon}
    {!collapsed && <span className="text-white fw-bold">{text}</span>}
  </div>
);

const SidebarDropdown = ({ icon, text, collapsed, links }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        className="gap-2 p-2 text-white rounded d-flex align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        {icon}
        {!collapsed && <span className="text-white fw-bold">{text}</span>}
      </div>

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
