<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Department;
use App\Models\DepartmentAdmin;
use App\Models\EmployeeEvaluation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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







 public function getUsersForEvaluation(Request $request)
 {
     $companyCode = $request->input('companyCode');
     $departmentIds = explode(',', $request->input('departments'));

     // Fetch users with their evaluations
     $users = DB::table('users')
         ->leftJoin('employee_evaluations', function ($join) use ($companyCode) {
             $join->on('users.id', '=', 'employee_evaluations.user_id')
                  ->where('employee_evaluations.company_id', $companyCode);
         })
         ->whereIn('users.department_id', $departmentIds) // Direct department_id column
         ->where('users.company_id', $companyCode)
         ->select(
             'users.id as user_id',
             'users.first_name',
             'users.last_name',
             'users.department_id',
             'employee_evaluations.rating',
             'employee_evaluations.comments',
             'employee_evaluations.evaluation_date'
         )
         ->get()
         ->groupBy('user_id'); // Group by user to handle multiple evaluations

     // Format the response
     $formattedUsers = [];
     foreach ($users as $userId => $userEvaluations) {
         $formattedUsers[] = [
             'user_id' => $userId,
             'first_name' => $userEvaluations->first()->first_name,
             'last_name' => $userEvaluations->first()->last_name,
             'department_id' => $userEvaluations->first()->department_id,
             'evaluations' => $userEvaluations->map(function ($eval) {
                 return [
                     'rating' => $eval->rating,
                     'comments' => $eval->comments,
                     'evaluation_date' => $eval->evaluation_date,
                 ];
             })->toArray(),
         ];
     }

     return response()->json(['users' => $formattedUsers]);
 }







     public function getEvaluationData(Request $request)
     {
         try {
             $companyCode = $request->query('companyCode');
             $departmentIds = explode(',', $request->query('departments'));

             // Validate company
             $company = Company::where('company_code', $companyCode)->first();
             if (!$company) {
                 return response()->json(['message' => 'Company not found'], 404);
             }

             // Get evaluation settings
             $settings = CompanySetting::where('company_id', $company->id)->first();
             if (!$settings) {
                 return response()->json(['message' => 'Company settings not configured'], 400);
             }

             // Validate departments
             $validDepartments = DB::table('departments')
                 ->whereIn('id', $departmentIds)
                 ->where('company_id', $company->id)
                 ->pluck('id');

                 $users = DB::table('users')
                 ->join('department_user', 'users.id', '=', 'department_user.user_id')
                 ->join('departments', 'department_user.department_id', '=', 'departments.id')
                 ->leftJoin('employee_evaluations', function($join) use ($company, $settings) {
                     $join->on('users.id', '=', 'employee_evaluations.user_id')
                          ->where('employee_evaluations.company_id', $company->id)
                          ->when($settings->frequency === 'daily', function($q) {
                              $q->whereDate('evaluation_date', now()->toDateString());
                          })
                          ->when($settings->frequency === 'weekly', function($q) {
                              $q->whereBetween('evaluation_date', [
                                  now()->startOfWeek(),
                                  now()->endOfWeek()
                              ]);
                          })
                          ->when($settings->frequency === 'monthly', function($q) {
                              $q->whereBetween('evaluation_date', [
                                  now()->startOfMonth(),
                                  now()->endOfMonth()
                              ]);
                          });
                 })
                 ->whereIn('department_user.department_id', $validDepartments)
                 ->select(
                     'users.id as user_id',
                     'users.first_name',
                     'users.last_name',
                     'departments.id as department_id',
                     'departments.name as department_name',
                     'employee_evaluations.rating',
                     'employee_evaluations.comments',
                     'employee_evaluations.evaluation_date'
                 )
                 ->get();



             // Format response
             $formattedUsers = [];
             foreach ($users as $userId => $departments) {
                 foreach ($departments as $deptId => $records) {
                     $formattedUsers[] = [
                         'user_id' => $userId,
                         'first_name' => $records->first()->first_name,
                         'last_name' => $records->first()->last_name,
                         'department_id' => $deptId,
                         'department_name' => $records->first()->department_name,
                         'evaluations' => $records->filter(fn($r) => $r->rating !== null)
                             ->map(fn($r) => [
                                 'rating' => $r->rating,
                                 'comments' => $r->comments,
                                 'evaluation_date' => $r->evaluation_date
                             ])->values()
                     ];
                 }
             }

             return response()->json([
                 'users' => $formattedUsers,
                 'settings' => $settings
             ]);

         } catch (\Exception $e) {
             Log::error("Evaluation data error: " . $e->getMessage());
             return response()->json(['message' => 'Server error'], 500);
         }
     }

     public function storeEvaluation(Request $request, $companyCode)
     {
         try {
             $validated = $request->validate([
                 'user_id' => 'required|exists:users,id',
                 'department_id' => 'sometimes|nullable|exists:departments,id',
                 'rating' => 'required|numeric|min:1|max:30',
                 'comments' => 'nullable|string|max:500',
                 'evaluation_date' => 'required|date',
                 'evaluated_by' => 'required|exists:users,id'
             ]);

             // Validate company and permissions

             $isAdmin = DepartmentAdmin::where([
                 'user_id' => $validated['evaluated_by'],
                 'department_id' => $validated['department_id'],
                 'company_id' => $companyCode
             ])->exists();

             if (!$isAdmin) {
                 return response()->json(['message' => 'Unauthorized access'], 403);
             }

             // Check evaluation frequency
             $settings = CompanySetting::where('company_id', $companyCode)->first();
             $existingEvaluation = EmployeeEvaluation::where([
                     'user_id' => $validated['user_id'],
                     'department_id' => $validated['department_id'],
                     'company_id' => $companyCode
                 ])
                 ->when($settings->frequency, function($q) use ($settings) {
                     $q->whereBetween('evaluation_date', $this->getDateRange($settings));
                 })
                 ->exists();

             if ($existingEvaluation) {
                 return response()->json([
                     'message' => "Only one evaluation allowed per {$settings->frequency} period"
                 ], 409);
             }

             // Create evaluation
             $evaluation = EmployeeEvaluation::create([
                 ...$validated,
                 'company_id' =>$companyCode
             ]);

             return response()->json([
                 'message' => 'Evaluation saved successfully',
                 'evaluation' => $evaluation
             ], 201);

            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error("Validation failed", ['errors' => $e->errors()]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }catch (\Exception $e) {
             Log::error("Evaluation save error: " . $e->getMessage());
             return response()->json(['message' => 'Server error'], 500);
         }
     }

     private function getDateRange($settings)
     {
         return match ($settings->frequency) {
             'daily' => [now()->startOfDay(), now()->endOfDay()],
             'weekly' => [now()->startOfWeek(), now()->endOfWeek()],
             'monthly' => [now()->startOfMonth(), now()->endOfMonth()],
             default => [now()->subCentury(), now()->addCentury()],
         };
     }

     public function showCom($companyCode)
     {

         $settings = CompanySetting::where('company_id', $companyCode)->firstOrFail();
         return response()->json($settings);
     }
 }

