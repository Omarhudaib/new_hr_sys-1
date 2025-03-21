import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // استيراد التخطيط العام
import HomePage from "./HomePage";
import UserList from "./Users/UserList";
import UserDetail from "./Users/UserDetail";
import UserForm from "./Users/UserCreat"; // إنشاء مستخدم جديد
import UserForme from "./Users/EditUser"; // تعديل مستخدم
import DepartmentPage from "./Departments/DepartmentPage";
import AddDepartmentPage from "./Departments/AddDepartmentPage";
import DepartmentEditorPage from "./Departments/DepartmentEditorPage";
import EditRolePage from "./Roles/EditRolePage";
import RoleListPage from "./Roles/RoleListPage";
import AddRolePage from "./Roles/AddRolePage";
import LeaveTypesPage from "./Leave/LeaveTypesPage";
import LeaveRequestsPage from "./Leave/LeaveRequestsPage";
import CheckInList from "./CheckIns/CheckInList";
import UserCheckIns from "./CheckIns/UserCheckIns";
import CheckInForm from "./CheckIns/CheckInForm";
import EditCompanyPage from "./Company/EditCompanyPage";
import CheckInSummary from "./CheckIns/CheckInSummary";
import MonthlyAttendance from "./CheckIns/MonthlyAttendance";
import LandingPage from "./LandingPage";
import CompanyManagement from "./CompanyManagement";
import SalaryPage from "./Company/SalaryPage";
import CompanySettingsPage from "./Company/CompanySettingsPage";
import AttendanceReportForm from "./Company/AttendanceReportForm";
import AttendanceReportsList from "./Company/AttendanceReportsList";
import MissingCheckoutsPage from "./Company/MissingCheckoutsPage";
import CheckInSummaryDep from "./Company/CheckInSummaryDep";
import CheckInSummaryChart from "./CheckIns/CheckInSummaryChart";
import LoginSuperAdmin from "./LoginSuperAdmin";
import EmployeeEvaluations from "./Users/EmployeeEvaluations"; 
import PermissionManagement from "./Users/PermissionManagement";
import Permission from "./Users/Permission";
import DepartmentAdmin from "./Users/DepartmentAdmin";


const App = () => {
  return (
      <Router>
<Routes>
  {/* ✅ فصل LandingPage عن Layout */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/LSA" element={<LoginSuperAdmin />} />
  <Route path="/" element={<Layout />}>
    <Route path="home" element={<HomePage />} />
    <Route path="users" element={<UserList />} />
    <Route path="users/:id" element={<UserDetail />} />
    <Route path="users/create" element={<UserForm />} />
    <Route path="users/edit/:id" element={<UserForme />} />
    <Route path="departments" element={<DepartmentPage />} />
    <Route path="departments/add" element={<AddDepartmentPage />} />
    <Route path="departments/edit/:id" element={<DepartmentEditorPage />} />
    <Route path="role" element={<RoleListPage />} />
    <Route path="leave_types" element={<LeaveTypesPage />} />
    <Route path="leave" element={<LeaveRequestsPage />} />
    <Route path="checkins" element={<CheckInList />} />
    <Route path="checkins/summary" element={<CheckInSummary />} />
    <Route path="checkins/summary-dep" element={<CheckInSummaryDep />} />
    <Route path="checkins/user/:userId" element={<UserCheckIns />} />
    <Route path="checkins/edit/:id" element={<CheckInForm />} />
    <Route path="MonthlyAttendance" element={<MonthlyAttendance />} />
    <Route path="checkins/create" element={<CheckInForm />} />
    <Route path="EditCompanyPage" element={<EditCompanyPage />} />
    <Route path="add-role" element={<AddRolePage />} />
    <Route path="role/edit-role/:id" element={<EditRolePage />} />
    <Route path="salary" element={<SalaryPage />} />
    <Route path="company-settings" element={<CompanySettingsPage />} />
    <Route path="company-reports/:reportId" element={<AttendanceReportForm />} />
    <Route path="attendance-reports" element={<AttendanceReportsList />} />
    <Route path="missingcheckouts" element={<MissingCheckoutsPage />} />
    <Route path="CheckInSummaryChart" element={<CheckInSummaryChart />} />
    <Route path="Evaluations" element={<EmployeeEvaluations />} />
    <Route path="PermissionManagement" element={<PermissionManagement />} />
    <Route path="Permission" element={<Permission />} />
    <Route path="DepartmentAdmin" element={<DepartmentAdmin/>} />
    
  </Route>
  

  <Route path="/SuperAdmin" element={<CompanyManagement />} />
</Routes>
</Router>
  );
};

export default App;
