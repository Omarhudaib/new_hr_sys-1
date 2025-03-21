<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Support\Facades\Log;
use App\Models\DepartmentAdmin;
use Illuminate\Support\Facades\Validator;

class UserPermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all();
        return response()->json($permissions, 200);
    }


    /**
     * إعطاء صلاحيات لمستخدم داخل شركة محددة
     */
    public function assignPermissionsToUser(Request $request, $company_code)
    {
        // التحقق من صحة البيانات المدخلة
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // العثور على الشركة باستخدام company_code
        $company = Company::where('company_code', $company_code)->firstOrFail();

        // العثور على المستخدم
        $user = User::findOrFail($request->user_id);

        // ربط الصلاحيات بالمستخدم في الشركة المحددة بدون تكرار الإدخالات
        foreach ($request->permissions as $permission_id) {
            $user->permissions()->syncWithoutDetaching([$permission_id => ['company_id' => $company->id]]);
        }

        return response()->json(['message' => 'Permissions assigned successfully'], 200);
    }

    /**
 * عرض جميع المستخدمين مع صلاحياتهم داخل شركة محددة
 */
public function showUserPermissions($company_code)
{
    try {
        Log::info("Fetching users for company", ['company_code' => $company_code]);

        // استرجاع الشركة باستخدام رمز الشركة
        $company = Company::where('company_code', $company_code)->first();

        if (!$company) {
            Log::warning("Company not found", ['company_code' => $company_code]);
            return response()->json(['message' => 'Company not found'], 404);
        }

        Log::info("Company found", ['company_id' => $company->id, 'company_name' => $company->name]);

        // جلب المستخدمين مع الصلاحيات للشركة المحددة
        $users = User::with(['permissions' => function ($query) use ($company) {
            $query->where('user_permissions.company_id', $company->id); // ✅ الحل هنا
        }])
        ->whereHas('permissions', function ($query) use ($company) {
            $query->where('user_permissions.company_id', $company->id); // ✅ الحل هنا
        })
        ->where('company_id', $company->id)
        ->get();

        Log::info("Users fetched", ['user_count' => $users->count()]);

        // تنسيق البيانات
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'full_name' => trim(implode(' ', array_filter([
                    $user->first_name,
                    $user->second_name,
                    $user->middle_name,
                    $user->last_name,
                ]))),
                'permissions' => $user->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'description' => $permission->description,
                    ];
                }),
            ];
        });

        if ($formattedUsers->isEmpty()) {
            Log::warning("No users with permissions found", ['company_id' => $company->id]);
            return response()->json(['message' => 'No users with permissions found for this company'], 404);
        }

        Log::info("Returning formatted users data", ['users' => $formattedUsers->toArray()]);
        return response()->json($formattedUsers, 200);

    } catch (\Exception $e) {
        Log::error("Error fetching users", [
            'company_code' => $company_code,
            'error_message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return response()->json(['message' => 'An error occurred', 'error' => $e->getMessage()], 500);
    }
}





    /**
     * تحديث صلاحيات المستخدم داخل شركة محددة
     */
    public function updateUserPermissions(Request $request, $company_code)
    {
        // التحقق من صحة البيانات المدخلة
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // العثور على الشركة باستخدام company_code
        $company = Company::where('company_code', $company_code)->firstOrFail();

        // العثور على المستخدم
        $user = User::findOrFail($request->user_id);

        // تحديث الصلاحيات داخل الشركة المحددة فقط دون حذف صلاحيات المستخدم في شركات أخرى
        $user->permissions()->wherePivot('company_id', $company->id)->detach();
        foreach ($request->permissions as $permission_id) {
            $user->permissions()->attach($permission_id, ['company_id' => $company->id]);
        }

        return response()->json(['message' => 'Permissions updated successfully'], 200);
    }


    public function addDepartmentAdmin(Request $request, $company_code)
    {
        // التحقق من البيانات القادمة باستخدام Validator
        Log::info('Validating data for addDepartmentAdmin', ['request' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
        ]);

        // إذا كانت هناك أخطاء في التحقق من البيانات
        if ($validator->fails()) {
            Log::error('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        // استرجاع الشركة باستخدام company_code
        Log::info('Retrieving company by company_code', ['company_code' => $company_code]);
        $company = Company::where('company_code', $company_code)->first();

        // Check if the company was found
        if (!$company) {
            Log::error('Company not found', ['company_code' => $company_code]);
            return response()->json([
                'message' => 'Company not found'
            ], 404);
        }

        // استدعاء دالة إضافة DepartmentAdmin من موديل Company
        Log::info('Attempting to add Department Admin', [
            'user_id' => $request->user_id,
            'department_id' => $request->department_id,
            'company_id' => $company->id
        ]);

        $result = $company->addDepartmentAdmin($request->user_id, $request->department_id);

        // التحقق من نجاح إضافة الـ DepartmentAdmin
        if ($result) {
            Log::info('Successfully added Department Admin', ['result' => $result]);
            return response()->json([
                'message' => 'Department Admin added successfully',
                'data' => $result
            ], 201); // 201 Created
        }

        Log::error('Failed to add Department Admin', [
            'user_id' => $request->user_id,
            'department_id' => $request->department_id,
            'company_id' => $company->id
        ]);

        return response()->json([
            'message' => 'Failed to add Department Admin. Ensure the user and department belong to the same company.'
        ], 400); // 400 Bad Request
    }

        // عرض جميع الـ DepartmentAdmins في الشركة
        public function showDepartmentAdmins($company_code)
        {
            $company = Company::where('company_code', $company_code)->firstOrFail();

            $departmentAdmins = $company->departmentAdmins; // الحصول على جميع DepartmentAdmins

            return response()->json([
                'message' => 'Department Admins retrieved successfully',
                'data' => $departmentAdmins
            ], 200);
        }

        // تعديل Department Admin
        public function updateDepartmentAdmin(Request $request, $company_code, $adminId)
        {
            // التحقق من البيانات القادمة باستخدام Validator
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'department_id' => 'required|exists:departments,id',
            ]);

            // إذا كانت هناك أخطاء في التحقق من البيانات
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // استرجاع الشركة باستخدام company_code
            $company = Company::where('company_code', $company_code)->firstOrFail();

            // استرجاع الـ DepartmentAdmin
            $departmentAdmin = DepartmentAdmin::find($adminId);

            if (!$departmentAdmin || $departmentAdmin->company_id != $company->id) {
                return response()->json([
                    'message' => 'Department Admin not found or does not belong to this company'
                ], 404);
            }

            // تحديث الـ DepartmentAdmin
            $departmentAdmin->user_id = $request->user_id;
            $departmentAdmin->department_id = $request->department_id;
            $departmentAdmin->save();

            return response()->json([
                'message' => 'Department Admin updated successfully',
                'data' => $departmentAdmin
            ], 200);
        }

        // حذف Department Admin
        public function deleteDepartmentAdmin($company_code, $adminId)
        {
            // استرجاع الشركة باستخدام company_code
            $company = Company::where('company_code', $company_code)->firstOrFail();

            // استرجاع الـ DepartmentAdmin
            $departmentAdmin = DepartmentAdmin::find($adminId);

            if (!$departmentAdmin || $departmentAdmin->company_id != $company->id) {
                return response()->json([
                    'message' => 'Department Admin not found or does not belong to this company'
                ], 404);
            }

            // حذف الـ DepartmentAdmin
            $departmentAdmin->delete();

            return response()->json([
                'message' => 'Department Admin deleted successfully'
            ], 200);
        }
    }


