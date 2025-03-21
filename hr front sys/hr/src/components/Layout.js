import React from "react";
import SidebarMenu from "../SidebarMenu"; // استيراد الشريط الجانبي
import { Outlet } from "react-router-dom"; // عرض المحتوى المتغير داخل الصفحة

const Layout = () => {
  return (
    <div className="d-flex">
      {/* الشريط الجانبي */}
      <SidebarMenu />

      {/* محتوى الصفحة */}
      <div className="p-1 flex-grow-1" style={{ width: "100%" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
