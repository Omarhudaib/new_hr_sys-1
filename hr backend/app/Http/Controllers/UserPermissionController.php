<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Support\Facades\Log;
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
}
