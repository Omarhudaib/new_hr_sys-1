import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import api from "./api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// تحميل الأنماط بناءً على كود الشركة
const loadCompanyStyle = async (companyCode) => {
  if (!companyCode) {
    console.warn("⚠️ No company code found, using default CSS.");
    return "default";
  }

  try {
    const response = await api.get(`/companySettings/${companyCode}`);
    if (!response.data || !response.data.style) {
      console.warn("⚠️ No style found, using default CSS.");
      return "default";
    }
    return response.data.style;
  } catch (error) {
    console.error("❌ API Error:", error);
    return "default";
  }
};

// تطبيق النمط الديناميكي
const applyStyle = (styleName) => {
  const existingLink = document.getElementById("dynamic-style");
  if (existingLink) {
    existingLink.href = `/css/${styleName}.css`; // تحديث الرابط بدلاً من إضافته مجددًا
  } else {
    const link = document.createElement("link");
    link.id = "dynamic-style";
    link.rel = "stylesheet";
    link.href = `/css/${styleName}.css`;
    link.onerror = () => console.error(`❌ Failed to load CSS: ${link.href}`);
    link.onload = () => console.log(`🎨 Successfully applied CSS: ${link.href}`);
    document.head.appendChild(link);
  }
};

// التحقق من حالة تسجيل الدخول واسترجاع بيانات الشركة من localStorage
const getCompanyDataFromLocalStorage = () => {
  const companyData = JSON.parse(localStorage.getItem("company"));
  return companyData ? companyData.company_code : null;
};

const RootComponent = () => {
  const [companyCode, setCompanyCode] = useState(() => getCompanyDataFromLocalStorage());
  const [isLoggedIn, setIsLoggedIn] = useState(!!companyCode);

  // استخدام useEffect لتحميل الأنماط عندما يتم التحقق من حالة تسجيل الدخول
  useEffect(() => {
    if (isLoggedIn && companyCode) {
      const cachedStyle = localStorage.getItem("style"); // استخدام التخزين المحلي لاختيار النمط
      if (cachedStyle) {
        applyStyle(cachedStyle);
      } else {
        loadCompanyStyle(companyCode).then((styleName) => {
          applyStyle(styleName);
          localStorage.setItem("style", styleName); // تخزين النمط في localStorage
        });
      }
    } else {
      applyStyle("default");
    }
  }, [isLoggedIn, companyCode]);

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
