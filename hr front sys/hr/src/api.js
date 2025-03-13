
  import axios from 'axios';
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const api = axios.create({
    baseURL: 'https://newhrsys-production.up.railway.app/api', // قم بتغيير هذا حسب خادمك
    headers: {"company_code":companyCode

    },
  });
  
  // Add a request interceptor for token handling
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken'); // أو من الكوكيز
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  export default api;