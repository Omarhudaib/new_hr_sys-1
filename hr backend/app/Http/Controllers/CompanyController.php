<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Department;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CompanyController extends Controller
{
    public function index($companyCode)
{
    try {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // تحميل العلاقات المطلوبة
        $companyData = $company->load(['users', 'role', 'departments']);

        // إضافة password_plain حتى يكون فارغًا عند الجلب
        $companyData->password_plain = '';

        return response()->json($companyData);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch company data', 'message' => $e->getMessage()], 500);
    }
}
public function update(Request $request, $companyCode)
{
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'additional_information' => 'nullable|string',
        'image_path' => 'nullable|string',
        'password' => 'nullable|string|min:8', // كلمة المرور اختيارية
    ]);

    try {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // فقط قم بتحديث كلمة المرور إذا تم إدخال واحدة جديدة
        if (!empty($validatedData['password'])) {
            $validatedData['password'] = bcrypt($validatedData['password']);
        } else {
            unset($validatedData['password']); // لا تقم بتحديث كلمة المرور
        }

        $company->update($validatedData);

        return response()->json($company);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to update company', 'message' => $e->getMessage()], 500);
    }
}

public function dashboard($companyCode, $month, $year)
{
    // Retrieve company details with related departments, settings, and users
    $company = Company::with([
        'departments:id,dep_name',
        'settings:id,company_id,work_hours,overtime_rate,overtime_enabled',
        'users:id,company_id,first_name,last_name,second_name,middle_name,user_code,work_type,salary'
    ])->where('company_code', $companyCode)->first();

    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    $settings = $company->settings;
    if (!$settings) {
        return response()->json(['error' => 'Company settings not found'], 404);
    }

    // Extract settings values
    $standardHours = $settings->work_hours;
    $overtimeRate = $settings->overtime_rate;
    $overtimeEnabled = $settings->overtime_enabled;
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

    // Get current date and calculate days elapsed in the month
    $currentDate = Carbon::now();
    $daysElapsed = $currentDate->day;

    // Calculate expected work hours up to the current date (pro-rated for part of the month)
    $monthlyStandardHours = $standardHours * $daysInMonth;
    $proratedHours = $standardHours * $daysElapsed; // This is the work hours expected until today

    // Retrieve users
    $users = $company->users;
    if ($users->isEmpty()) {
        return response()->json(['message' => 'No users found for this company'], 404);
    }

    // Retrieve check-ins and leave requests in bulk for performance
    $userIds = $users->pluck('id');

    $checkins = DB::table('check_ins')
        ->whereIn('user_id', $userIds)
        ->whereMonth('check_in', $month)
        ->whereYear('check_in', $year)
        ->get()
        ->groupBy('user_id');

    $leaveRequests = DB::table('leave_requests')
        ->whereIn('user_id', $userIds)
        ->whereMonth('start_date', $month)
        ->whereYear('start_date', $year)
        ->where('status', 'approved')
        ->get()
        ->groupBy('user_id');

    // Generate user summary
    $detailedSummary = $users->map(function ($user) use ($month, $year, $daysInMonth, $proratedHours, $overtimeRate, $overtimeEnabled, $checkins, $leaveRequests) {
        $dailyData = [];
        $totalHours = 0;
        $userCheckins = $checkins[$user->id] ?? collect();
        $userLeaveRequests = $leaveRequests[$user->id] ?? collect();

        $checkinsByDate = $userCheckins->keyBy(fn($c) => Carbon::parse($c->check_in)->toDateString());
        $leaveRequestsByDate = $userLeaveRequests->keyBy(fn($l) => Carbon::parse($l->start_date)->toDateString());

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = sprintf('%04d-%02d-%02d', $year, $month, $day);

            $checkIn = $checkinsByDate->get($date);
            $checkOut = $checkIn?->check_out;
            $leaveRequest = $leaveRequestsByDate->get($date);
            $standardHours=192;
            $workedHours = 0;
            if ($checkIn && $checkOut) {
                $workedHours = round((strtotime($checkOut) - strtotime($checkIn->check_in)) / 3600, 2);
            }
            if ($leaveRequest) {
                $workedHours += $standardHours;
            }

            $dailyData[] = [
                'date' => $date,
                'check_in' => $checkIn?->check_in,
                'check_out' => $checkOut,
                'hours_worked' => $workedHours,
                'status' => $checkIn ? ($checkOut ? 'Checked Out' : 'Checked In') : ($leaveRequest ? 'On Leave' : 'Absent'),
            ];

            $totalHours += $workedHours;
        }

        // Calculate overtime hours and delay hours based on prorated standard hours for the partial month
        $overtimeHours = $overtimeEnabled ? max(0, $totalHours - $proratedHours) : 0;
        $overtimeAmount = $overtimeHours * $overtimeRate;
        $delayHours = max(0, $proratedHours - $totalHours);
        $socialSecurity = $this->calculateSocialSecurity($user->salary, $user->work_type);

        $finalSalary = $user->salary + $overtimeAmount - ($delayHours * ($user->salary / $proratedHours));

        return [
            'user_id' => $user->id,
            'user_name' => trim("{$user->first_name} {$user->middle_name} {$user->second_name} {$user->last_name}"),
            'base_salary' => $user->salary,
            'overtime_amount' => $overtimeAmount,
            'final_salary' => round($finalSalary, 2),
            'daily_data' => $dailyData,
            'total_hours' => round($totalHours, 2),
            'overtime_hours' => $overtimeHours,
            'delay_hours' => $delayHours,
            'total_leaves' => $userLeaveRequests->count(),
            'social_security' => round($socialSecurity['total'], 2),
            'employee_social_security' => round($socialSecurity['employee'], 2),
            'company_social_security' => round($socialSecurity['company'], 2),
        ];
    });

    // Aggregate data
    $aggregated = [
        'total_final_salary' => $detailedSummary->sum('final_salary'),
        'total_hours_worked' => $detailedSummary->sum('total_hours'),
        'total_overtime_hours' => $detailedSummary->sum('overtime_hours'),
        'total_leaves' => $detailedSummary->sum('total_leaves'),
        'avg_base_salary' => round($company->users()->avg('salary'), 2),
    ];

    // Return response
    return response()->json([
        'company' => [
            'id' => $company->id,
            'company_code' => $company->company_code,
            'name' => $company->name,
            'total_departments' => $company->departments()->count(),
            'total_users' => $company->users()->count(),
        ],
        'aggregated' => $aggregated,
        'detailed_summary' => $detailedSummary,
    ]);
}

// دالة حساب التأمينات الاجتماعية
private function calculateSocialSecurity($salary, $workType)
{
    $employeeRate = 5.25;
    $companyRate = $workType === 'hazardous' ? 19.5 : 16.5;

    return [
        'employee' => $salary * ($employeeRate / 100),
        'company' => $salary * ($companyRate / 100),
        'total' => ($salary * ($employeeRate / 100)) + ($salary * ($companyRate / 100)),
    ];
}

}
