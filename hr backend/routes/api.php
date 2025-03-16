<?php
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CheckInsController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanySettingController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Controllers\ContactMeController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\EmployeeEvaluationController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\UsersPermissionsController;


Route::post('/contact', [ContactMeController::class, 'store']);
Route::post('/super-admin/login', [LoginController::class, 'loginSuperAdmin']);
Route::post('/login', [LoginController::class, 'loginCompany']);
Route::post('/user-login',[LoginController::class,'loginUser']);









Route::middleware(['auth:sanctum'])->group(function () {
  Route::get('/user-Request/{id}', [LeaveRequestController::class, 'UserRequest']);
  Route::get('/user-get/{id}', [UserController::class, 'getUserData']);
  Route::post('/user-checkIn/{id}', [CheckInsController::class, 'checkIn']);
  Route::post('/user-checkOut/{id}', [CheckInsController::class, 'checkOut']);
  Route::post('/user-submitRequest/{id}', [LeaveRequestController::class, 'submitRequest']);
  Route::get('/leave-types/{company_id}', [LeaveTypeController::class, 'leavetypesu']);
  Route::post('/user/{userid}', [UserController::class, 'updateUserData']);
  Route::get('/user-checkStatus/{userid}', [CheckInsController::class, 'checkStatus']);
  Route::post('/userpassword/{userid}', [UserController::class, 'updatePassword']);
});

Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum'); // Logout route with Sanctum auth middleware

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('permissions', [UserPermissionController::class, 'index']);
    Route::post('assign-permissions/{company_code}', [UserPermissionController::class, 'assignPermissionsToUser']);
Route::get('/user-permissions/{company_code}', [UserPermissionController::class, 'showUserPermissions']);
    Route::put('update-permissions/{company_code}', [UserPermissionController::class, 'updateUserPermissions']);

    Route::get('/usersc/{company_code}', [UserController::class, 'index']);
    Route::get('/users/{company_code}/{id}', [UserController::class, 'show']);
    Route::post('/users/{company_code}', [UserController::class, 'store']);
    Route::post('/users/update/{company_code}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    //Route::get('/company/{companyCode}/roles', [UserController::class, 'index']);
    Route::get('leave_types/{companyCode}', [LeaveTypeController::class, 'index']);
    Route::get('leave_types/{companyCode}/{id}', [LeaveTypeController::class, 'show']);
    Route::post('leave_types/{companyCode}', [LeaveTypeController::class, 'store']);
    Route::put('leave_types/{companyCode}/{id}', [LeaveTypeController::class, 'update']);

    Route::delete('leave_types/{companyCode}/{id}', [LeaveTypeController::class, 'destroy']);
    Route::get('leave_requests/{companyCode}', [LeaveRequestController::class, 'index']);
    Route::post('leave_requests/{companyCode}', [LeaveRequestController::class, 'store']);
    Route::post('leave_requests/{companyCode}/{id}', [LeaveRequestController::class, 'update']);
    Route::post('leave_requests/s/{companyCode}/{id}', [LeaveRequestController::class, 'update']);
    Route::delete('leave_requests/{companyCode}/{id}', [LeaveRequestController::class, 'destroy']);
    Route::get('/role/{companyCode}', [RoleController::class, 'index']);
    Route::post('/roles/{companyCode}', [RoleController::class, 'store']);
    Route::put('/roles/{companyCode}/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{companyCode}/{id}', [RoleController::class, 'destroy']);
    Route::get('/roles/{companyCode}/{id}', [RoleController::class, 'show']);
    Route::get('/departments/{companyCode}', [DepartmentController::class, 'index']);
    Route::post('/departments/{companyCode}', [DepartmentController::class, 'store']); // Add department
    Route::get('/department/{companyCode}/{id}', [DepartmentController::class, 'show']);
    Route::put('/departments/{companyCode}/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{companyCode}/{id}', [DepartmentController::class, 'destroy']);
    Route::post('/companySettings/{companyCode}', [CompanySettingController::class, 'update']);
    Route::get('/calculateMonthlySalaries/{companyCode}/{month}/{year}', [SalaryController::class, 'calculateMonthlySalaries']);
    Route::get('attendance-reports/{companyCode}', [AttendanceReportController::class, 'index']);
    Route::post('attendance-reports/', [AttendanceReportController::class, 'store']);
    Route::put('attendance-reports/{id}', [AttendanceReportController::class, 'update']);
    Route::delete('attendance-reports/{id}', [AttendanceReportController::class, 'destroy']);
    Route::post('/attendance-reports/generate', [AttendanceReportController::class, 'generateReport']);
    Route::get('/attendance-reports', [AttendanceReportController::class, 'getReportsByMonthYear']);
    Route::put('/attendance-reports/{id}', [AttendanceReportController::class, 'updateReport']);
    Route::get('/notifications/{company_code}', [CheckInsController::class, 'getNotifications']);
    Route::get('/companySettings/{companyCode}', [CompanySettingController::class, 'show']);
    Route::get('/company/{companyCode}/dashboard/{month}/{year}', [CompanyController::class, 'dashboard']);
    Route::get('/checkins/dailyCheckIns/{companyCode}', [CheckInsController::class, 'dailyCheckIns']);
    Route::get('/checkins/{companyCode}', [CheckInsController::class, 'index']); // List all check-ins for a specific company
    Route::get('/checkins/user/{companyCode}/{id}', [CheckInsController::class, 'userCheckIns']); // List check-ins for a specific user in a company
    Route::get('/checkin/user/m/{companyCode}/{userId}', [CheckInsController::class, 'CheckInUser']);
    Route::post('/checkins/{companyCode}', [CheckInsController::class, 'store']); // Create a new check-in for a company
    Route::get('/checkins/{companyCode}/{id}', [CheckInsController::class, 'show']); // Show a specific check-in
    Route::put('/checkins/{companyCode}/{id}', [CheckInsController::class, 'update']); // Update a check-in
    Route::delete('/checkins/{companyCode}/{id}', [CheckInsController::class, 'destroy']); // Delete a check-in
    Route::post('/checkins/summary/{companyCode}/{Month}/{Year}', [CheckInsController::class, 'summary']);
    Route::post('/departments/{companyCode}/{month}/{year}', [CheckInsController::class, 'departmentSummary']);

    Route::post('/checkins/{companyCode}/bulk-upload', [CheckInsController::class, 'bulkUpload']); // Bulk upload check-ins
    Route::get('/checkins/{companyCode}/filter', [CheckInsController::class, 'filterByUserAndDate']); // Filter check-ins by user and date range
    Route::get('/company/{companyCode}', [CompanyController::class, 'index']);
    Route::put('/company/{companyCode}', [CompanyController::class, 'update']);
    Route::get('/missing-checkouts/{company_code}', [CheckInsController::class, 'getMissingCheckOuts']);
    Route::get('employee-evaluations/{companyCode}', [EmployeeEvaluationController::class, 'index']);
    Route::post('employee-evaluations/{companyCode}', [EmployeeEvaluationController::class, 'store']);
    Route::put('employee-evaluations/{id}', [EmployeeEvaluationController::class, 'update']);
});


Route::middleware(['auth:sanctum', 'super-admin'])->group(function () {
 // إرسال رسالة
Route::get('/contact', [ContactMeController::class, 'index']);   // جلب جميع الرسائل
Route::get('/contact/{id}', [ContactMeController::class, 'show']); // جلب رسالة معينة
Route::post('/contact/{id}/reply', [ContactMeController::class, 'reply']); // إرسال رد
Route::delete('/contact/{id}', [ContactMeController::class, 'destroy']); // حذف رسالة
Route::get('/superadmin/companies',[SuperAdminController::class,'indexCompany']);
Route::put('/superadmin/companies',[SuperAdminController::class,'updateCompany']);
Route::post('/superadmin/companies',[SuperAdminController::class,'storeCompany']);
Route::post('/register', [RegisterController::class, 'register']);

});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['check.permission:View_User'])->group(function () {
        Route::get('/user/usersc/{company_code}', [UsersPermissionsController::class, 'index']);
        Route::get('/user/users/{company_code}/{id}', [UsersPermissionsController::class, 'show']);
    });
    Route::middleware(['check.permission:Edit_User'])->group(function () {
        Route::get('/user/role/{companyCode}', [UsersPermissionsController::class, 'indexRole']);
        Route::post('/user/users/update/{company_code}', [UsersPermissionsController::class, 'update']);
        Route::get('/user/departments/{companyCode}', [UsersPermissionsController::class, 'indexDepartments']);
    });

    Route::middleware(['check.permission:Add_User'])->group(function () {
        Route::post('/user/users/{company_code}', [UsersPermissionsController::class, 'store']);
        Route::get('/user/departments/{companyCode}', [UsersPermissionsController::class, 'indexDepartments']);
        Route::get('/user/role/{companyCode}', [UsersPermissionsController::class, 'indexRole']);
    });

    Route::middleware(['check.permission:View_Login/Logout_Summary'])->group(function () {

        
    });


});
