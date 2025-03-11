import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import api from "./api"; // تأكد من أن ملف api.js معد بشكل صحيح
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const loadCompanyStyle = async (companyCode) => {
  if (!companyCode) {
    console.warn("⚠️ No company code found, using default CSS.");
    return "default"; // العودة إلى النمط الافتراضي إذا لم يتم العثور على كود الشركة
  }

  try {
    console.log(`📡 Fetching style for company: ${companyCode}`);
    const response = await api.get(`/companySettings/${companyCode}`); // تأكد من استخدام companyCode بشكل صحيح
    
    console.log("✅ API Response:", response.data);
    
    if (!response.data || !response.data.style) {
      console.warn("⚠️ No style found, using default CSS.");
      return "default"; // العودة إلى النمط الافتراضي إذا لم يكن هناك نمط
    }

    return response.data.style;
  } catch (error) {
    console.error("❌ API Error:", error);
    return "default"; // العودة إلى النمط الافتراضي في حالة حدوث خطأ
  }
};

const applyStyle = (styleName) => {
  const existingLink = document.getElementById("dynamic-style");
  if (existingLink) {
    document.head.removeChild(existingLink);
  }

  const link = document.createElement("link");
  link.id = "dynamic-style";
  link.rel = "stylesheet";
  link.href = `/css/${styleName}.css`; // استخدام ملف CSS واحد لجميع الأنماط

  // ✅ التحقق من تحميل الملف بنجاح أو تسجيل خطأ
  link.onerror = () => console.error(`❌ Failed to load CSS: ${link.href}`);
  link.onload = () => console.log(`🎨 Successfully applied CSS: ${link.href}`);

  document.head.appendChild(link);
};

const RootComponent = () => {
  const [companyCode, setCompanyCode] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // حالة التحقق من تسجيل الدخول

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول في localStorage
    const companyData = JSON.parse(localStorage.getItem("company"));
    
    if (companyData) {
      const companyCode = companyData.company_code; // الحصول على company_code
      setCompanyCode(companyCode); // تخزين الكود في الحالة
      setIsLoggedIn(true); // إذا كانت هناك بيانات، يعني أن المستخدم سجل الدخول

      console.log("🔍 Retrieved companyCode:", companyCode); // تأكيد أن الكود مسترجع بشكل صحيح
    } else {
      console.warn("⚠️ No company data found in localStorage.");
      setIsLoggedIn(false); // إذا لم تكن هناك بيانات، يعني أن المستخدم ليس مسجل دخول
    }
  }, []);

  useEffect(() => {
    // تحميل الأنماط بناءً على كود الشركة فقط إذا كان المستخدم قد سجل الدخول
    if (isLoggedIn && companyCode) {
      loadCompanyStyle(companyCode).then(styleName => {
        applyStyle(styleName);
      });
    } else {
      applyStyle("default"); // إذا لم يكن هناك تسجيل دخول، استخدم النمط الافتراضي
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
