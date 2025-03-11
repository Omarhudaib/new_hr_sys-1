<?php

namespace App\Http\Controllers;
use App\Models\AttendanceReport;
use App\Models\CheckIn;
use App\Models\Company;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_id'    => 'required|exists:users,id',
            'company_code' => 'required|exists:companies,company_code',
            'month'      => 'required|integer',
            'year'       => 'required|integer',
            'total_hours'    => 'required|numeric',
            'overtime_hours' => 'required|numeric',
            'delay_hours'    => 'required|numeric',
            'total_leaves'   => 'required|integer',
            'final_hours'    => 'required|numeric',
        ]);

        // العثور على الشركة باستخدام company_code
        $company = Company::where('company_code', $request->company_code)->first();

        // التحقق مما إذا كانت الشركة موجودة
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // إضافة company_id إلى الطلب
        $request->merge(['company_id' => $company->id]);

        // إنشاء تقرير الحضور الجديد
        $report = AttendanceReport::create($request->all());

        return response()->json($report, 201);
    }


    public function index($companyCode)
    {
        // العثور على الشركة باستخدام company_code
        $company = Company::where('company_code', $companyCode)->first();

        // التحقق مما إذا كانت الشركة موجودة
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // جلب تقارير الحضور بناءً على company_id
        $reports = AttendanceReport::where('company_id', $company->id)->get();

        return response()->json($reports);
    }

    public function update(Request $request, $id)
{
    $request->validate([
        'total_hours'    => 'required|numeric|min:0',
        'overtime_hours' => 'required|numeric|min:0',
        'delay_hours'    => 'required|numeric|min:0',
        'total_leaves'   => 'required|numeric|min:0',
        'final_salary'   => 'required|numeric|min:0',
    ]);

    $report = AttendanceReport::find($id);
    if (!$report) {
        return response()->json(['status' => 'error', 'message' => 'التقرير غير موجود'], 404);
    }

    $report->update($request->all());

    return response()->json([
        'status'  => 'success',
        'message' => 'تم تحديث التقرير بنجاح',
        'report'  => $report,
    ]);
}

    public function destroy($id)
    {
        $report = AttendanceReport::findOrFail($id);
        $report->delete();

        return response()->json(null, 204);
    }
    public function updateReport(Request $request, $id)
{
    $request->validate([
        'total_hours'    => 'required|numeric|min:0',
        'overtime_hours' => 'required|numeric|min:0',
        'delay_hours'    => 'required|numeric|min:0',
        'total_leaves'   => 'required|numeric|min:0',
        'final_salary'   => 'required|numeric|min:0',
    ]);

    $report = AttendanceReport::find($id);
    if (!$report) {
        return response()->json(['status' => 'error', 'message' => 'التقرير غير موجود'], 404);
    }

    $report->update([
        'total_hours'    => $request->total_hours,
        'overtime_hours' => $request->overtime_hours,
        'delay_hours'    => $request->delay_hours,
        'total_leaves'   => $request->total_leaves,
        'final_hours'    => $request->final_salary,
    ]);

    return response()->json([
        'status'  => 'success',
        'message' => 'تم تحديث التقرير بنجاح',
        'report'  => $report,
    ]);
}
public function getReportsByMonthYear(Request $request)
{
    $request->validate([
        'month'        => 'required|integer|min:1|max:12',
        'year'         => 'required|integer|min:2000|max:2100',
        'company_code' => 'required|string|exists:companies,company_code',
    ]);

    $company = Company::where('company_code', $request->company_code)->first();
    if (!$company) {
        return response()->json(['status' => 'error', 'message' => 'الشركة غير موجودة'], 404);
    }

    $reports = AttendanceReport::where('company_id', $company->id)
        ->where('month', $request->month)
        ->where('year', $request->year)
        ->with(['user', 'company'])
        ->get();

    return response()->json([
        'status'  => 'success',
        'reports' => $reports,
    ]);
}
public function generateReport(Request $request)
{
    // التحقق من المدخلات (الشهر والسنة والشركة)
    $request->validate([
        'month'        => 'required|integer|min:1|max:12',
        'year'         => 'required|integer|min:2000|max:' . date('Y'),
        'company_code' => 'required|string|exists:companies,company_code',
    ]);

    $month = $request->month;
    $year  = $request->year;
    $company = Company::where('company_code', $request->company_code)->first();

    if (!$company) {
        return response()->json(['status' => 'error', 'message' => 'الشركة غير موجودة'], 404);
    }

    // جلب إعدادات الشركة من جدول company_settings عبر العلاقة
    $companySetting = $company->companySetting;
    $standardHours = $companySetting?->work_hours ?? 8;
    $overtimeRate  = $companySetting?->overtime_rate ?? 1.5;
    // في حال عدم وجود إعداد لخصم التأخير، نستخدم القيمة الافتراضية
    $deductionRate = 1;

    // حساب الأيام في الشهر والعدد المتوقع لساعات العمل في الشهر
    $daysInMonth = Carbon::createFromDate($year, $month)->daysInMonth;
    $expectedMonthlyHours = $standardHours * $daysInMonth;

    // جلب جميع موظفي الشركة
    $users = User::where('company_id', $company->id)->get();
    if ($users->isEmpty()) {
        return response()->json(['status' => 'error', 'message' => 'لا يوجد موظفون في الشركة'], 404);
    }

    // حساب إجمالي الساعات من سجل الحضور لكل موظف
    $summary = CheckIn::whereIn('user_id', $users->pluck('id'))
        ->whereMonth('check_in', $month)
        ->whereYear('check_in', $year)
        ->select('user_id', DB::raw('SUM(TIMESTAMPDIFF(HOUR, check_in, check_out)) as total_hours'))
        ->groupBy('user_id')
        ->get();

    // حساب عدد أيام الإجازات الموافق عليها لكل موظف
    $leaves = LeaveRequest::whereIn('user_id', $users->pluck('id'))
        ->whereMonth('start_date', $month)
        ->whereYear('start_date', $year)
        ->where('status', 'approved')
        ->selectRaw('user_id, COUNT(*) as total_leaves')
        ->groupBy('user_id')
        ->get();

    $reports = [];

    foreach ($users as $user) {
        $userSummary = $summary->firstWhere('user_id', $user->id);
        $userLeaves  = $leaves->firstWhere('user_id', $user->id);

        $totalHours  = $userSummary->total_hours ?? 0;
        $totalLeaves = $userLeaves->total_leaves ?? 0;

        // تعويض ساعات العمل بناءً على أيام الإجازة (كل يوم إجازة يُعوض بعدد الساعات القياسية)
        $leaveCompensationHours = $totalLeaves * $standardHours;
        $adjustedTotalHours = $totalHours + $leaveCompensationHours;

        // حساب ساعات العمل الإضافي أو التأخير بالمقارنة مع الساعات المتوقعة
        $overtimeHours = max(0, $adjustedTotalHours - $expectedMonthlyHours);
        $delayHours    = max(0, $expectedMonthlyHours - $adjustedTotalHours);

        // التحقق مما إذا كان تفعيل العمل الإضافي معطل في إعدادات الشركة
        if (!$companySetting?->overtime_enabled) {
            $overtimeHours = 0;
        }

        $overtimePay = $overtimeHours * $overtimeRate;
        $deduction   = $delayHours * $deductionRate;

        // حساب الراتب النهائي
        $baseSalary  = $user->salary ?? 500;
        $finalSalary = max($baseSalary + $overtimePay - $deduction, 0);

        // تحديث أو إنشاء تقرير الحضور للموظف
        $report = AttendanceReport::updateOrCreate(
            [
                'user_id'    => $user->id,
                'company_id' => $company->id,
                'month'      => $month,
                'year'       => $year,
            ],
            [
                'total_hours'    => $totalHours,
                'overtime_hours' => $overtimeHours,
                'delay_hours'    => $delayHours,
                'total_leaves'   => $totalLeaves,
                'final_hours'    => $finalSalary,
            ]
        );

        $reports[] = $report;
    }

    return response()->json([
        'status'  => 'success',
        'message' => 'تم إنشاء التقارير بنجاح',
        'reports' => $reports,
    ]);
}


}
