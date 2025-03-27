<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;

use App\Models\Company;
use App\Models\SuperAdmin;
use App\Models\DepartmentAdmin;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{public function loginUser(Request $request)
    {
        // Validate input
        $request->validate([
            'user_code' => 'required',
            'password' => 'required',
        ]);

        // Find user by user_code
        $user = User::where('user_code', $request->user_code)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        // Validate password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Fetch permissions
        $abilities = $user->permissions()->pluck('name')->toArray();

        // **Check if user is a department admin**
        $isDepartmentAdmin = DepartmentAdmin::where('user_id', $user->id)->exists();

        // **Get all departments the user is admin for**
        $adminDepartments = DepartmentAdmin::where('user_id', $user->id)
        ->join('departments', 'departments.id', '=', 'department_admins.department_id')
        ->select('departments.id', 'departments.dep_name') // ✅ Fetch department name
        ->get();


        // Generate API Token
        $token = $user->createToken('User API Token', $abilities)->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User login successful.',
            'user' => $user,
            'token' => $token,
            'permissions' => $abilities,
            'is_department_admin' => $isDepartmentAdmin, // ✅ Send admin status
            'admin_departments' => $adminDepartments, // ✅ Send departments user is admin for
        ], 200);
    }


    public function loginSuperAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Debugging: Check if the email and password are correctly passed
        Log::info('Email: ' . $request->email);
        Log::info('Password: ' . $request->password);

        $superAdmin = SuperAdmin::where('email', $request->email)->first();

        // Debugging: Check if the super admin exists
        if (!$superAdmin) {
            Log::error('Super Admin not found');
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email.',
            ], 404);
        }

        // Check if the password matches
        if (!Hash::check($request->password, $superAdmin->password)) {
            Log::error('Incorrect password for email: ' . $request->email);
            return response()->json([
                'status' => 'error',
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        // Create token and return response
        $token = $superAdmin->createToken('SuperAdminToken', ['super-admin'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Super Admin login successful.',
            'super_admin' => $superAdmin,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }


    public function loginCompany(Request $request)
    {
        $request->validate([
            'company_code' => 'required|string',
            'password' => 'required|string',
        ]);

        // البحث عن الشركة باستخدام رمز الشركة
        $company = Company::where('company_code', $request->company_code)->first();

        if (!$company) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid company code.',
            ], 404);
        }

        // التحقق من كلمة المرور
        if (Hash::check($request->password, $company->password)) {

            // تخصيص الصلاحيات المقرونة بالشركة (على سبيل المثال: 'company_access')
            $abilities = ['company_access']; // أو يمكن إضافة صلاحيات متعددة حسب الحاجة

            // إنشاء التوكن مع الصلاحيات
            $token = $company->createToken('Company API Token', $abilities)->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Company login successful.',
                'company' => $company,
                'token' => $token,
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid credentials.',
        ], 400);
    }

    public function logout(Request $request)
    {
        try {
            // Revoke the token that was used to authenticate the request
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully.',
            ], 200);
        } catch (\Exception $e) {
         Log::error('Logout Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Logout failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
