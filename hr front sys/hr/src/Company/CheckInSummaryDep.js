import React, { useState, useEffect } from "react"; 
import api from "../api";
import * as XLSX from "xlsx";

const convertToTime = (hours) => {
  const totalMinutes = Math.round(hours * 60);
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;
  return `${hoursPart}:${minutesPart.toString().padStart(2, "0")}`;
};

const CheckInSummary = () => {
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyStandardHours, setMonthlyStandardHours] = useState(192);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState(""); 
  const [departments, setDepartments] = useState([]);

  const company = JSON.parse(localStorage.getItem("company"));
  const companyCode = company?.company_code;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get(`/departments/${companyCode}`);
        setDepartments(response.data);
      } catch (error) {
        setError("Failed to fetch departments");
      }
    };

    fetchDepartments();
  }, [companyCode]);

  const handleRequest = async () => {
    if (!companyCode || !department) {
      setError("Please select a department and ensure the company code is available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/departments/${companyCode}/${month}/${year}`, {
        standard_hours: monthlyStandardHours,
        department_id: department,
  
    
      });

      if (response.data.message) {
        setError(response.data.message);
      } else {
        setSummary(response.data);
      }
    } catch (error) {
      setError("Failed to fetch summary data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const worksheetData = summary.map((item) => ({
      "User Name": item.user_name,
      ...item.daily_data.reduce((acc, day) => {
        acc[day.date] = day.status === "On Leave" ? "On Leave" : calculateHoursWorked(day.check_in, day.check_out);
        return acc;
      }, {}),
      "Total Leaves": item.total_leaves,
      "Total Hours": convertToTime(item.total_hours),
      "Overtime Hours": convertToTime(item.overtime_hours),
      "Delay Hours": convertToTime(item.delay_hours),
      "Base Salary": item.base_salary,
      "Overtime Amount": item.overtime_amount,
      "Final Salary": item.final_salary,
      "Social Security": item.social_security,
      "Employee Social Security": item.employee_social_security,
      "Company Social Security": item.company_social_security,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
    XLSX.writeFile(workbook, `checkin_summary_${month}_${year}.xlsx`);
  };

  const handlePrintTable = () => {
    const printContent = document.getElementById('tableToPrint').outerHTML;
    const newWindow = window.open('', '', 'width=900,height=700');
    newWindow.document.write('<html><head><title>Print Table</title></head><body>');
    newWindow.document.write(printContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
  };

  const calculateHoursWorked = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "0:00";
    const diffInMs = new Date(checkOut) - new Date(checkIn);
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return convertToTime(parseFloat(diffInHours.toFixed(2)));
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month - 1, i + 1).toLocaleDateString("en-CA"));

  return (
    <div className="container mt-1">
      <h1 className="mb-4 text-center text-primary">Check-in Summary</h1>

      <div className="mb-3 d-flex">
        <button className="btn btn-primary me-2" onClick={handleExportExcel}>Download as Excel</button>
        <button className="btn btn-secondary me-2" onClick={handlePrintTable}>Print Table</button>
        <button className="btn btn-info me-2" onClick={handleRequest}>Request Data</button>
      </div>

      <div className="mb-4 row">
        <div className="col-md-4">
          <label htmlFor="department">Select Department:</label>
          <select
            id="department"
            className="form-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.dep_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-4">
          <label htmlFor="month">Select Month:</label>
          <select id="month" className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{(index + 1).toString().padStart(2, "0")}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="year">Select Year:</label>
          <select id="year" className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2025, 2024, 2023].map((yr) => <option key={yr} value={yr}>{yr}</option>)}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="standardHours">Monthly Standard Hours:</label>
          <input type="number" id="standardHours" className="form-control" value={monthlyStandardHours} onChange={(e) => setMonthlyStandardHours(Number(e.target.value))} />
        </div>
      </div>

      {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
        <table className="table table-bordered" id="tableToPrint">
        <thead>
          <tr>
            <th>User Name</th>
            {dateHeaders.map((date, index) => <th key={index}>{date}</th>)}
            <th>Total Leaves</th>
            <th>Total Hours</th>
            <th>Overtime Hours</th>
            <th>Delay Hours</th>
            <th>Base Salary</th>
            <th>Overtime Amount</th>
            <th>Final Salary</th>
            <th>Social Security</th>
            <th>Employee Social Security</th>
            <th>Company Social Security</th>
          </tr>
        </thead>
        <tbody>
          {summary.length > 0 ? summary.map((item) => (
            <tr key={item.user_id}>
              <td>{item.user_name}</td>
              {item.daily_data.map((day, index) => (
                <td key={index} className={day.status === "On Leave" ? "text-danger" : ""}>
                  {day.status === "On Leave" ? "On Leave" : calculateHoursWorked(day.check_in, day.check_out)}
                </td>
              ))}
              <td>{item.total_leaves}</td>
              <td>{convertToTime(item.total_hours)}</td>
              <td>{convertToTime(item.overtime_hours)}</td>
              <td>{convertToTime(item.delay_hours)}</td>
              <td>{item.base_salary}</td>
              <td>{item.overtime_amount}</td>
              <td>{item.final_salary}</td>
              <td>{item.social_security}</td>
              <td>{item.employee_social_security}</td>
              <td>{item.company_social_security}</td>
            </tr>
          )) : <tr><td colSpan={dateHeaders.length + 6} className="text-center">No data available</td></tr>}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default CheckInSummary;
