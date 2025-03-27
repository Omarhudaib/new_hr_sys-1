<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\DepartmentAdmin;
use App\Models\EmployeeEvaluation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class EmployeeEvaluationController extends Controller
{public function index($company_code)
    {
        // البحث عن الشركة باستخدام كود الشركة
        $company = Company::where('company_code', $company_code)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        // جلب تقييمات الموظفين المرتبطة بهذه الشركة
        $evaluations = EmployeeEvaluation::whereHas('user', function ($query) use ($company) {
            $query->where('company_id', $company->id);
        })->with('user:id,first_name,last_name')->get();

        return response()->json($evaluations);
    }


    public function store(Request $request, $company_code)
    {
        // البحث عن الشركة باستخدام كود الشركة
        $company = Company::where('company_code', $company_code)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        // التحقق من صحة البيانات
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'rating' => 'required|numeric|min:1|max:30',
            'comments' => 'nullable|string',
            'evaluated_by' => 'nullable|exists:users,id',
            'evaluation_date' => 'nullable|date',
        ]);

        // إضافة `company_id` إلى البيانات
        $validated['company_id'] = $company->id;

        // إنشاء تقييم جديد
        $evaluation = EmployeeEvaluation::create($validated);

        return response()->json([
            'message' => 'Employee evaluation created successfully',
            'evaluation' => $evaluation
        ], 201);
    }

    public function update(Request $request, $company_code, $id)
    {
        // البحث عن الشركة باستخدام الكود
        $company = Company::where('company_code', $company_code)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'rating' => 'required|numeric|min:1|max:30',
            'comments' => 'nullable|string',
            'evaluated_by' => 'nullable|exists:users,id',
            'evaluation_date' => 'nullable|date',
        ]);

        // البحث عن التقييم
        $evaluation = EmployeeEvaluation::where('id', $id)
            ->whereHas('user', function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })
            ->first();

        if (!$evaluation) {
            return response()->json(['message' => 'Evaluation not found'], 404);
        }

        // تحديث التقييم
        $evaluation->update($validated);

        return response()->json([
            'message' => 'Employee evaluation updated successfully',
            'evaluation' => $evaluation
        ], 200);
    }



    public function getUsersForEvaluation(Request $request)
    {
        $companyCode = $request->input('companyCode');

        // Fetch users with their evaluations without department filtering
        $users = DB::table('users')
            ->leftJoin('employee_evaluations', function ($join) use ($companyCode) {
                $join->on('users.id', '=', 'employee_evaluations.user_id')
                     ->where('employee_evaluations.company_id', $companyCode);
            })
            ->where('users.company_id', $companyCode)
            ->select(
                'users.id as user_id',
                'users.first_name',
                'users.last_name',
                'employee_evaluations.rating',
                'employee_evaluations.comments',
                'employee_evaluations.evaluation_date'
            )
            ->get()
            ->groupBy('user_id'); // Group by user for multiple evaluations

        // Format the response
        $formattedUsers = [];
        foreach ($users as $userId => $userEvaluations) {
            $formattedUsers[] = [
                'user_id' => $userId,
                'first_name' => $userEvaluations->first()->first_name,
                'last_name' => $userEvaluations->first()->last_name,
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

            // Fetch all users in the company with their evaluations
            $users = DB::table('users')
                ->leftJoin('employee_evaluations', function ($join) use ($company, $settings) {
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
                ->where('users.company_id', $company->id)
                ->select(
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'employee_evaluations.rating',
                    'employee_evaluations.comments',
                    'employee_evaluations.evaluation_date'
                )
                ->get();

            // Format response
            $formattedUsers = [];
            foreach ($users as $user) {
                $formattedUsers[$user->user_id]['user_id'] = $user->user_id;
                $formattedUsers[$user->user_id]['first_name'] = $user->first_name;
                $formattedUsers[$user->user_id]['last_name'] = $user->last_name;
                $formattedUsers[$user->user_id]['evaluations'][] = [
                    'rating' => $user->rating,
                    'comments' => $user->comments,
                    'evaluation_date' => $user->evaluation_date,
                ];
            }

            return response()->json([
                'users' => array_values($formattedUsers),
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
