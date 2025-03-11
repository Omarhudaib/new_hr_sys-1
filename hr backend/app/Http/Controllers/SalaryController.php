<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\Company;
use App\Models\LeaveRequest;
use App\Models\Salary;
use App\Models\User;
use Carbon\Carbon;
use App\Models\SocialSecurity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SalaryController extends Controller
{
    public function calculateMonthlySalaries(Request $request, $companyCode, $month, $year)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $settings = $company->settings;
        if (!$settings) {
            return response()->json(['error' => 'Company settings not found'], 404);
        }

        // Standard settings for salary calculation
        $dailyStandard = $settings->work_hours ?? 8;
        $overtimeRate = $settings->overtime_rate ?? 1.5;
        $overtimeEnabled = $settings->overtime_enabled ?? false;
        $insuranceRate = $settings->insurance_rate ?? 1;
        $socialSecurityRate = $settings->social_security_rate ?? 7.5;
        $hourlyRateSetting = $settings->hourly_rate ?? null;

        // Social Security rates for different work types
        $rates = [
            'normal' => [
                'employee' => $settings->social_security_rate ?? 7.5,
                'employer' => $settings->employer_social_security_rate ?? 14.25,
            ],
            'hazardous' => [
                'employee' => $settings->hazardous_social_security_rate ?? 10,
                'employer' => $settings->hazardous_employer_social_security_rate ?? 15.75,
            ]
        ];

        // Additional bonus (if any) from the request
        $additionalBonus = $request->input('additional_bonus', 0);
        $results = [];

        // Get all users for the company and group check-ins by user_id
        $users = $company->users;
        $allCheckIns = CheckIn::where('company_id', $company->id)
            ->whereMonth('check_in', $month)
            ->whereYear('check_in', $year)
            ->get()
            ->groupBy('user_id');

        foreach ($users as $user) {
            // Fetch the base salary and work type from the User model
            $baseSalary = $user->salary;
            $workType = $user->work_type ?? 'normal';
            $hourlyRate = $hourlyRateSetting ?: ($baseSalary / (22 * $dailyStandard));
            $checkIns = $allCheckIns->get($user->id, collect());

            $totalHours = 0;
            $overtimeHours = 0;
            $delayHours = 0;

            // Fetch leave requests for the employee in the given month and year
            $leaveRequests = LeaveRequest::where('user_id', $user->id)
                ->whereMonth('start_date', $month)
                ->whereYear('start_date', $year)
                ->get();

            // Subtract leave hours from total hours
            foreach ($leaveRequests as $leave) {
                $leaveDuration = Carbon::parse($leave->start_date)
                    ->diffInHours(Carbon::parse($leave->end_date));
                $totalHours -= $leaveDuration;
            }

            // Calculate total worked hours, overtime, and delay from check-ins
            foreach ($checkIns as $checkIn) {
                if ($checkIn->check_out) {
                    $checkInTime = Carbon::parse($checkIn->check_in);
                    $checkOutTime = Carbon::parse($checkIn->check_out);
                    $hours = $checkInTime->diffInHours($checkOutTime);
                    $totalHours += $hours;

                    if ($hours > $dailyStandard) {
                        $overtimeHours += $hours - $dailyStandard;
                    } else {
                        $delayHours += $dailyStandard - $hours;
                    }
                }
            }

            // Calculate each salary component
            $overtimePay = $overtimeEnabled ? ($overtimeHours * $hourlyRate * $overtimeRate) : 0;
            $delayDeduction = $delayHours * $hourlyRate;
            $insuranceDeduction = ($insuranceRate / 100) * $baseSalary;

            $socialSecurityRateEmployee = $rates[$workType]['employee'];
            $socialSecurityRateEmployer = $rates[$workType]['employer'];
            $socialSecurityDeduction = ($socialSecurityRateEmployee / 100) * $baseSalary;
            $totalSocialSecurity = ($socialSecurityRateEmployer / 100) * $baseSalary;

            $netSalary = $baseSalary + $overtimePay + $additionalBonus - $delayDeduction - $insuranceDeduction - $socialSecurityDeduction;

            // Update or create the salary record
            Salary::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'month'   => $month,
                    'year'    => $year,
                ],
                [
                    'company_id'    => $company->id,
                    'salary_amount' => $baseSalary,
                    'bonus'         => round($overtimePay, 2),
                    'deductions'    => round($delayDeduction + $insuranceDeduction + $socialSecurityDeduction, 2),
                    'net_salary'    => round($netSalary, 2),
                ]
            );




            // Prepare the result data to return in the JSON response
            $results[] = [
                'user_id'                    => $user->id,
                'user_name'                  => trim("{$user->first_name} {$user->last_name}"),
                'base_salary'                => round($baseSalary, 2),
                'total_hours'                => round($totalHours, 2),
                'overtime_hours'             => round($overtimeHours, 2),
                'delay_hours'                => round($delayHours, 2),
                'hourly_rate'                => round($hourlyRate, 2),
                'overtime_pay'               => round($overtimePay, 2),
                'delay_deduction'            => round($delayDeduction, 2),
                'insurance_deduction'        => round($insuranceDeduction, 2),
                'social_security_deduction'  => round($socialSecurityDeduction, 2),
                'net_salary'                 => round($netSalary, 2),
                'work_type'                  => $workType,
            ];
        }

        return response()->json($results);
    }

    public function update(Request $request, $id)
    {
        $salary = Salary::findOrFail($id);
        $salary->update($request->all());
        return response()->json(['message' => 'Salary updated successfully', 'salary' => $salary]);
    }
}
