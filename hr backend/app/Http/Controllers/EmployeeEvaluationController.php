<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\EmployeeEvaluation;
use Illuminate\Http\Request;

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

}
