import React, { useState, useEffect } from "react";
import api from "../api"; // استيراد API
import LoadingSpinner from "../LoadingSpinner"; // مكون التحميل

const MonthlyAttendance = () => {
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const companyCode = JSON.parse(localStorage.getItem("company"))?.company_code;

  // جلب بيانات المستخدمين
  const fetchUsers = () => {
    const token = localStorage.getItem("authToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    api.get(`/usersc/${companyCode}`, config)
      .then((response) => setUsers(response.data))
      .catch(() => setError("Error fetching users"));
  };

  // جلب بيانات الحضور الشهري
  const fetchMonthlyAttendance = (userId, month, year) => {
    setLoading(true);
    const params = new URLSearchParams({ month, year });
    const token = localStorage.getItem("authToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    api.get(`/checkin/user/m/${companyCode}/${userId}?${params.toString()}`, config)
      .then((response) => {
        console.log("Response from API:", response.data);
        setMonthlyAttendance(response.data.attendance || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching monthly attendance:", error);
        setError("Error fetching monthly attendance");
        setLoading(false);
      });
  };

  // تحميل المستخدمين عند تشغيل الصفحة
  useEffect(() => {
    fetchUsers();
  }, [companyCode]);

  // تحميل الحضور عند تغيير المستخدم أو التاريخ
  useEffect(() => {
    if (selectedUser && selectedMonth && selectedYear) {
      fetchMonthlyAttendance(selectedUser, selectedMonth, selectedYear);
    }
  }, [selectedUser, selectedMonth, selectedYear]);

  return (
    <div className="mb-4 text-center text-primary">
      <h1>Monthly Attendance</h1>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* اختيار المستخدم */}
        <div className="col-md-4">
          <div className="form-group">
            <label>Select User</label>
            <select className="form-control" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Select a User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* اختيار الشهر */}
        <div className="col-md-4">
          <div className="form-group">
            <label>Select Month</label>
            <select className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="">Select a Month</option>
              {[...Array(12)].map((_, index) => (
                <option key={index + 1} value={String(index + 1).padStart(2, "0")}>
                  {new Date(0, index).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* اختيار السنة */}
        <div className="col-md-4">
          <div className="form-group">
            <label>Select Year</label>
            <select className="form-control" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Select a Year</option>
              {[...Array(5)].map((_, i) => {
                const year = 2025 - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* جدول الحضور */}
      {selectedUser && selectedMonth && selectedYear && (
        <div>
          <h4>Attendance for {selectedMonth}/{selectedYear}</h4>
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {monthlyAttendance.length > 0 ? (
                monthlyAttendance.map((entry) => (
                  <tr key={entry.date}>
                    <td>{entry.date}</td>
                    <td>{entry.status}</td>
                    <td>{entry.work_hours === 0 ? "00:00" : entry.work_hours}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlyAttendance;
