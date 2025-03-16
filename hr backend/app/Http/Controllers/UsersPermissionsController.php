<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UsersPermissionsController extends Controller
{
 // List all users for the same company as the authenticated user
 public function indexDepartments($companyCode)
    {


        // Fetch all departments for the company
        $departments = Department::where('company_id', $companyCode)->get();

        return response()->json($departments);
    }
 public function indexRole($companyCode)
    {



        $roles = Role::where('company_id', $companyCode)->get();

        if ($roles->isEmpty()) {
            return response()->json(['message' => 'No roles found for this company'], 404);
        }

        return response()->json($roles);
    }
 public function index($companyCode)
 {
     try {
         Log::info("Fetching users for company: {$companyCode}");

         $users = User::with(['role', 'department'])
                     ->where('company_id', $companyCode)
                     ->get();

         Log::info("Successfully fetched " . count($users) . " users for company: {$companyCode}");

         return response()->json($users);
     } catch (\Exception $e) {
         Log::error("Error fetching users for company {$companyCode}: " . $e->getMessage());

         return response()->json(['error' => 'Failed to fetch users'], 500);
     }
 }




 public function show($companyCode, $id)
 {
     try {

         // Fetch the user by company_id and user id
         $user = User::with(['role', 'department'])
                     ->where('company_id', $companyCode)  // Ensure the user belongs to the company
                     ->findOrFail($id);  // Find the user by ID, or fail if not found

         return response()->json($user, 200);
     } catch (\Exception $e) {
         return response()->json(['error' => 'Failed to fetch user', 'message' => $e->getMessage()], 500);
     }
 }

 public function store(Request $request, $companyCode)
 {
     try {
         // التحقق من الصلاحيات عبر الميدل وير
         $request->validate([
             'first_name'               => 'required|string|max:255',
             'last_name'                => 'required|string|max:255',
             'user_code'                => 'required|string|unique:users,user_code',
             'password'                 => 'required|string|min:8',
             'role_id'                  => 'required|integer|exists:role,id',
             'department_id'            => 'nullable|integer|exists:departments,id',
             'additional_information'   => 'nullable|string',
             'second_name'              => 'nullable|string|max:255',
             'middle_name'              => 'nullable|string|max:255',
             'image_path'               => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:4048',
             'national_id'              => 'nullable|string|max:20',
             'marital_status'           => 'nullable|string|in:single,married,divorced,widowed',
             'attendtaby'               => 'nullable|in:any location,dep location',
             'date_of_birth'            => 'nullable|date',
             'holidays'                 => 'nullable|integer',
             'salary'                   => 'nullable|numeric',
             'sick_days'                => 'nullable|integer',
             'annual_vacations_days'    => 'nullable|integer',
             'work_type'                => 'nullable|in:normal,hazardous',
         ]);

         // تشفير كلمة المرور
         $validated['password'] = bcrypt($request->password);
         $validated['company_id'] = $companyCode; // استخدام الـ companyCode

         // معالجة رفع الصورة
         if ($request->hasFile('image_path')) {
             $imagePath = $request->file('image_path')->store('users', 'public');
             $validated['image_path'] = $imagePath;
         }

         // إنشاء المستخدم
         $user = User::create($validated);

         return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
     } catch (\Illuminate\Validation\ValidationException $e) {
         return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
     } catch (\Exception $e) {
         Log::error('Failed to create user', ['error' => $e->getMessage()]);
         return response()->json(['error' => 'Failed to create user'], 500);
     }
 }
 public function update(Request $request, $companyCode)
 {
     try {
         $id = $request->input('id');

         $user = User::where('company_id', $companyCode)->find($id);
         if (!$user) {
             return response()->json(['error' => 'User not found'], 404);
         }

         // تحقق من المدخلات
         $validated = $request->validate([
             'first_name'               => 'nullable|string|max:255',
             'last_name'                => 'nullable|string|max:255',
             'user_code'                => 'nullable|string|unique:users,user_code,' . $id,
             'role_id'                  => 'nullable|integer|exists:role,id',
             'department_id'            => 'nullable|integer|exists:departments,id',
             'password'                 => 'nullable|string|min:8',
             'additional_information'   => 'nullable|string',
             'second_name'              => 'nullable|string|max:255',
             'middle_name'              => 'nullable|string|max:255',
             'image_path'               => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4048',
             'national_id'              => 'nullable|string|max:20',
             'marital_status'           => 'nullable|string|in:single,married,divorced',
             'attendtaby'               => 'nullable|in:any location,dep location',
             'date_of_birth'            => 'nullable|date',
             'holidays'                 => 'nullable|integer',
             'salary'                   => 'nullable|numeric',
             'sick_days'                => 'nullable|integer',
             'annual_vacations_days'    => 'nullable|integer',
             'work_type'                => 'nullable|in:normal,hazardous',
         ]);

         // تحديث كلمة المرور إذا كانت موجودة
         if (!empty($validated['password'])) {
             $validated['password'] = bcrypt($validated['password']);
         } else {
             unset($validated['password']);
         }

         // معالجة رفع الصورة
         if ($request->hasFile('image_path')) {
             if ($user->image_path) {
                 Storage::disk('public')->delete($user->image_path);
             }
             $imagePath = $request->file('image_path')->store('users', 'public');
             $validated['image_path'] = $imagePath;
         }

         // تحديث بيانات المستخدم
         $user->update($validated);

         return response()->json(['message' => 'User updated successfully', 'user' => $user], 200);
     } catch (\Illuminate\Validation\ValidationException $e) {
         return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
     } catch (\Exception $e) {
         Log::error('Failed to update user', ['error' => $e->getMessage()]);
         return response()->json(['error' => 'Failed to update user'], 500);
     }
 }


}
