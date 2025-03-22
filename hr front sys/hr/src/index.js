import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import api from "./api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

const RootComponent = () => {
  const location = useLocation();
  const [companyCode, setCompanyCode] = useState(() => getCompanyDataFromLocalStorage());
  const [isLoggedIn, setIsLoggedIn] = useState(!!companyCode);

  useEffect(() => {
    if (location.pathname === "/") {
      applyStyle("landing");
      return;
    }

    if (isLoggedIn && companyCode) {
      const cachedStyle = localStorage.getItem("style");
      if (cachedStyle) {
        applyStyle(cachedStyle);
      } else {
        loadCompanyStyle(companyCode).then((styleName) => {
          applyStyle(styleName);
          localStorage.setItem("style", styleName);
        });
      }
    } else {
      applyStyle("default");
    }
  }, [isLoggedIn, companyCode, location.pathname]);

  return <App />;
};

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

const applyStyle = (styleName) => {
  const existingLink = document.getElementById("dynamic-style");
  if (existingLink) {
    existingLink.href = `/css/${styleName}.css`;
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

const getCompanyDataFromLocalStorage = () => {
  const companyData = JSON.parse(localStorage.getItem("company"));
  return companyData ? companyData.company_code : null;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <RootComponent />
    </Router>
  </React.StrictMode>
);
