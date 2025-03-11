<?php
namespace App\Http\Controllers;
use App\Models\CheckIn;
use App\Models\Company;
use App\Models\Department;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpParser\Node\Stmt\Else_;
use Illuminate\Support\Facades\Cache;

class CheckInsController extends Controller
{public function summary(Request $request, $companyCode, $month, $year)
    {
        // الحصول على الشركة والبيانات المرتبطة بها بما في ذلك الإعدادات
        $company = Company::where('company_code', $companyCode)
            ->with([
                'settings',
                'users:id,company_id,first_name,last_name,second_name,middle_name,user_code,work_type,salary', // إضافة العمل والراتب
            ])
            ->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $settings = $company->settings; // استخدام settings هنا
        if (!$settings) {
            return response()->json(['error' => 'Company settings not found'], 404);
        }

        $standardHours = $settings->work_hours; // استخدام العمل ساعات من إعدادات الشركة
        $overtimeRate = $settings->overtime_rate; // معدل الساعات الإضافية
        $overtimeEnabled = $settings->overtime_enabled; // تمكين الساعات الإضافية

        // أخذ الساعات الشهرية من الطلب
        $monthlyStandardHours = $request->input('monthlyStandardHours', $standardHours * cal_days_in_month(CAL_GREGORIAN, $month, $year)); // قيمة افتراضية بناءً على الساعات اليومية

        // باقي الكود لا يحتاج إلى تعديل
        $users = $company->users;

        if ($users->isEmpty()) {
            return response()->json(['message' => 'No users found for this company'], 404);
        }

        // حساب عدد الأيام في الشهر
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        // بناء الاستعلام لحساب البيانات بشكل دقيق
        $result = $users->map(function ($user) use ($month, $year, $daysInMonth, $standardHours, $overtimeRate, $overtimeEnabled, $monthlyStandardHours) {
            $dailyData = [];
            $totalHours = 0;

            // استرجاع بيانات CheckIn و CheckOut للمستخدم لهذا الشهر
            $checkins = DB::table('check_ins')
                ->where('user_id', $user->id)
                ->whereMonth('check_in', $month)
                ->whereYear('check_in', $year)
                ->get();

            // استرجاع طلبات الإجازات لهذا الشهر
            $leaveRequests = DB::table('leave_requests')
                ->where('user_id', $user->id)
                ->whereMonth('start_date', $month)
                ->whereYear('start_date', $year)
                ->where('status', 'approved')
                ->get();

            // حساب إجمالي الإجازات المعتمدة
            $totalLeaves = $leaveRequests->count();

            // تحويل بيانات الحضور وطلبات الإجازات إلى مصفوفات للتعامل معها بسهولة
            $checkinsByDate = $checkins->keyBy(function ($checkin) {
                return \Carbon\Carbon::parse($checkin->check_in)->toDateString();
            });

            $leaveRequestsByDate = $leaveRequests->keyBy(function ($leaveRequest) {
                return \Carbon\Carbon::parse($leaveRequest->start_date)->toDateString();
            });

            // إنشاء بيانات لكل يوم في الشهر
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $date = sprintf('%04d-%02d-%02d', $year, $month, $day);

                // استرجاع بيانات CheckIn و CheckOut
                $checkIn = $checkinsByDate->get($date);
                $checkOut = $checkIn ? $checkIn->check_out : null;

                // استرجاع طلب الإجازات
                $leaveRequest = $leaveRequestsByDate->get($date);

                // حساب الساعات المعمول بها
                $workedHours = 0;
                if ($checkIn && $checkOut) {
                    $checkInTime = strtotime($checkIn->check_in);
                    $checkOutTime = strtotime($checkOut);
                    $workedHours = round(($checkOutTime - $checkInTime) / 3600, 2); // تقريبه إلى منزلتين عشريتين
                }

                // إضافة ساعات الإجازة إلى الساعات اليومية
                if ($leaveRequest) {
                    $workedHours += $standardHours; // إضافة الساعات المقررة إذا كان الموظف في إجازة
                }

                // إضافة البيانات اليومية للمستخدم
                $dailyData[] = [
                    'date' => $date,
                    'check_in' => $checkIn ? $checkIn->check_in : null,
                    'check_out' => $checkOut ? $checkOut : null,
                    'hours_worked' => $workedHours,
                    'status' => $checkIn ? ($checkOut ? 'Checked Out' : 'Checked In') : ($leaveRequest ? 'On Leave' : 'Absent'),
                ];

                $totalHours += $workedHours;
            }

            // حساب الساعات الإضافية إذا كانت مفعلّة
            $overtimeHours = 0;
            if ($overtimeEnabled) {
                // التأكد من حساب الساعات الإجمالية
                $overtimeHours = max(0, $totalHours - $monthlyStandardHours); // استخدام الساعات الشهرية من الطلب
            }

            // حساب الساعات الإضافية باستخدام المعدل
            $overtimeAmount = $overtimeHours * $overtimeRate;

            // حساب الساعات المتأخرة
            $delayHours = max(0, $monthlyStandardHours - $totalHours);

            // حساب الضمان الاجتماعي بناءً على نوع العمل
            $socialSecurityRate = 0;
            $employeeRate = 5.25; // حصة الموظف الثابتة
            $companyRate = 16.5; // حصة الشركة للأعمال العادية
            if ($user->work_type === 'hazardous') {
                $socialSecurityRate = 24.75; // نسبة الضمان الاجتماعي للأعمال الخطرة
                $companyRate = 19.5; // حصة الشركة للأعمال الخطرة
            } else {
                $socialSecurityRate = 21.75; // نسبة الضمان الاجتماعي للأعمال العادية
            }

            // حساب خصم الموظف وحصة الشركة
            $employeeSocialSecurity = $user->salary * ($employeeRate / 100);
            $companySocialSecurity = $user->salary * ($companyRate / 100);

            // حساب إجمالي الضمان الاجتماعي
            $totalSocialSecurity = $employeeSocialSecurity + $companySocialSecurity;

            // حساب الراتب الإجمالي مع الساعات الإضافية والنقص
            $baseSalary = $user->salary; // الراتب الأساسي
            $finalSalary = $baseSalary + $overtimeAmount - ($delayHours * ($baseSalary / $monthlyStandardHours)); // خصم النقص في الساعات

            return [
                'user_id' => $user->id,
              'user_name' => $user->first_name . ' ' . $user->middle_name . ' ' . $user->second_name . ' ' . $user->last_name,
                'base_salary' => $baseSalary, // الراتب الأساسي
                'overtime_amount' => $overtimeAmount, // الأجر الإضافي
                'final_salary' => round($finalSalary, 2), // الراتب النهائي بعد خصم النقص في الساعات
                'daily_data' => $dailyData,
                'total_hours' => round($totalHours, 2), // تقريب الساعات إلى منزلتين عشريتين
                'overtime_hours' => $overtimeHours,
                'delay_hours' => $delayHours,
                'total_leaves' => $totalLeaves, // إضافة عدد الإجازات
                'social_security' => round($totalSocialSecurity, 2), // إضافة مجموع الضمان الاجتماعي
                'employee_social_security' => round($employeeSocialSecurity, 2), // حصة الموظف
                'company_social_security' => round($companySocialSecurity, 2), // حصة الشركة
            ];
        });

        return response()->json($result);
    }

    public function departmentSummary(Request $request, $companyCode, $month, $year)
    {
        // الحصول على الشركة والبيانات المرتبطة بها بما في ذلك الإعدادات
        $company = Company::where('company_code', $companyCode)
            ->with([
                'settings',
                'users' => function ($query) use ($request) {
                    $query->select('id', 'company_id', 'first_name', 'last_name', 'second_name', 'middle_name', 'user_code', 'work_type', 'salary', 'department_id');

                    // إذا تم تحديد department_id في الطلب
                    if ($request->has('department_id')) {
                        $query->where('department_id', $request->department_id);
                    }
                }
            ])
            ->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $settings = $company->settings;
        if (!$settings) {
            return response()->json(['error' => 'Company settings not found'], 404);
        }

        // إرجاع المستخدمين بناءً على الدائرة المحددة
        $users = $company->users;

        // إذا لم يتم تحديد department_id، يتم إرجاع جميع المستخدمين
        if ($request->has('department_id')) {
            $users = $users->where('department_id', $request->department_id);
        }

        if ($users->isEmpty()) {
            return response()->json(['message' => 'No users found for this department'], 404);
        }

        // حساب البيانات بناءً على المستخدمين المسترجعين
        $result = $users->map(function ($user) use ($month, $year, $settings) {
            $dailyData = [];
            $totalHours = 0;

            // استرجاع بيانات CheckIn و CheckOut للمستخدم لهذا الشهر
            $checkins = DB::table('check_ins')
                ->where('user_id', $user->id)
                ->whereMonth('check_in', $month)
                ->whereYear('check_in', $year)
                ->get();

            // استرجاع طلبات الإجازات لهذا الشهر
            $leaveRequests = DB::table('leave_requests')
                ->where('user_id', $user->id)
                ->whereMonth('start_date', $month)
                ->whereYear('start_date', $year)
                ->where('status', 'approved')
                ->get();

            // حساب إجمالي الإجازات المعتمدة
            $totalLeaves = $leaveRequests->count();

            // تحويل بيانات الحضور وطلبات الإجازات إلى مصفوفات للتعامل معها بسهولة
            $checkinsByDate = $checkins->keyBy(function ($checkin) {
                return \Carbon\Carbon::parse($checkin->check_in)->toDateString();
            });

            $leaveRequestsByDate = $leaveRequests->keyBy(function ($leaveRequest) {
                return \Carbon\Carbon::parse($leaveRequest->start_date)->toDateString();
            });

            // إنشاء بيانات لكل يوم في الشهر
            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $date = sprintf('%04d-%02d-%02d', $year, $month, $day);

                // استرجاع بيانات CheckIn و CheckOut
                $checkIn = $checkinsByDate->get($date);
                $checkOut = $checkIn ? $checkIn->check_out : null;

                // استرجاع طلب الإجازات
                $leaveRequest = $leaveRequestsByDate->get($date);

                // حساب الساعات المعمول بها
                $workedHours = 0;
                if ($checkIn && $checkOut) {
                    $checkInTime = strtotime($checkIn->check_in);
                    $checkOutTime = strtotime($checkOut);
                    $workedHours = round(($checkOutTime - $checkInTime) / 3600, 2); // تقريبه إلى منزلتين عشريتين
                }

                // إضافة ساعات الإجازة إلى الساعات اليومية
                if ($leaveRequest) {
                    $workedHours += $settings->work_hours; // إضافة الساعات المقررة إذا كان الموظف في إجازة
                }

                // إضافة البيانات اليومية للمستخدم
                $dailyData[] = [
                    'date' => $date,
                    'check_in' => $checkIn ? $checkIn->check_in : null,
                    'check_out' => $checkOut ? $checkOut : null,
                    'hours_worked' => $workedHours,
                    'status' => $checkIn ? ($checkOut ? 'Checked Out' : 'Checked In') : ($leaveRequest ? 'On Leave' : 'Absent'),
                ];

                $totalHours += $workedHours;
            }

            // حساب الساعات الإضافية إذا كانت مفعلّة
            $overtimeHours = 0;
            $overtimeEnabled = $settings->overtime_enabled;
            if ($overtimeEnabled) {
                $monthlyStandardHours = $settings->work_hours * $daysInMonth; // تقدير الساعات الشهرية
                $overtimeHours = max(0, $totalHours - $monthlyStandardHours); // حساب الساعات الإضافية
            }

            // حساب الأجر الإضافي
            $overtimeAmount = $overtimeHours * $settings->overtime_rate;

            // حساب الساعات المتأخرة
            $delayHours = max(0, $monthlyStandardHours - $totalHours);

            // حساب الضمان الاجتماعي
            $employeeRate = 5.25;
            $companyRate = 16.5;

            $employeeSocialSecurity = $user->salary * ($employeeRate / 100);
            $companySocialSecurity = $user->salary * ($companyRate / 100);

            $totalSocialSecurity = $employeeSocialSecurity + $companySocialSecurity;

            // حساب الراتب الإجمالي
            $baseSalary = $user->salary;
            $finalSalary = $baseSalary + $overtimeAmount - ($delayHours * ($baseSalary / $monthlyStandardHours));

            return [
                'user_id' => $user->id,
                'user_name' => $user->first_name . ' ' . $user->middle_name . ' ' . $user->second_name . ' ' . $user->last_name,
                'base_salary' => $baseSalary,
                'overtime_amount' => $overtimeAmount,
                'final_salary' => round($finalSalary, 2),
                'daily_data' => $dailyData,
                'total_hours' => round($totalHours, 2),
                'overtime_hours' => $overtimeHours,
                'delay_hours' => $delayHours,
                'total_leaves' => $totalLeaves,
                'social_security' => round($totalSocialSecurity, 2),
                'employee_social_security' => round($employeeSocialSecurity, 2),
                'company_social_security' => round($companySocialSecurity, 2),
            ];
        });

        return response()->json($result);
    }


    public function getMissingCheckOuts($companyCode)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $missingCheckOuts = CheckIn::where('company_id', $company->id)
            ->whereNull('check_out')
            ->whereDate('check_in', '<', now()->toDateString())
            ->with('user:id,first_name,last_name')
            ->get();

        return response()->json($missingCheckOuts);
    }


    public function CheckInUser(Request $request, $companyCode, $userId)
    {
        $month = $request->query('month');
        $year = $request->query('year');

        // البحث عن الشركة باستخدام الكود
        $company = Company::where('company_code', $companyCode)->first();
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // تحديد نطاق التواريخ للشهر المطلوب
        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->endOfDay();

        // جلب بيانات الحضور من جدول CheckIn
        $checkIns = CheckIn::where('company_id', $company->id)
            ->where('user_id', $userId)
            ->whereBetween('check_in', [$startDate, $endDate])
            ->get()
            ->groupBy(fn($item) => Carbon::parse($item->check_in)->toDateString());

        // جلب بيانات الإجازات المعتمدة من جدول LeaveRequest
        $leaveRequests = LeaveRequest::where('company_id', $company->id)
            ->where('user_id', $userId)
            ->where('status', 'approved') // فقط الإجازات الموافق عليها
            ->whereBetween('start_date', [$startDate, $endDate]) // التأكد من أن بداية الإجازة داخل الشهر
            ->orWhereBetween('end_date', [$startDate, $endDate]) // أو نهايتها داخل الشهر
            ->get();

        // تحويل الإجازات إلى قائمة تواريخ
        $leaveDates = [];
        foreach ($leaveRequests as $leave) {
            $leaveStart = Carbon::parse($leave->start_date);
            $leaveEnd = Carbon::parse($leave->end_date);

            for ($date = $leaveStart; $date->lte($leaveEnd); $date->addDay()) {
                $leaveDates[] = $date->toDateString();
            }
        }

        // إنشاء بيانات الحضور
        $attendanceData = [];
        for ($day = 1; $day <= $startDate->daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day)->toDateString();

            if (in_array($date, $leaveDates)) {
                // إذا كان اليوم ضمن أيام الإجازات
                $attendanceData[] = [
                    'date' => $date,
                    'status' => 'On Leave',
                    'work_hours' => '00:00'
                ];
            } elseif (isset($checkIns[$date])) {
                // إذا كان هناك تسجيل دخول
                $workHours = 0;
                foreach ($checkIns[$date] as $checkIn) {
                    if ($checkIn->check_out) {
                        $startTime = Carbon::parse($checkIn->check_in);
                        $endTime = Carbon::parse($checkIn->check_out);
                        $workHours += $endTime->diffInMinutes($startTime); // فرق الوقت بالدقائق
                    }
                }

                $attendanceData[] = [
                    'date' => $date,
                    'status' => 'Checked In',
                    'work_hours' => gmdate("H:i", $workHours * 60) // تحويل الدقائق إلى HH:mm
                ];
            } else {
                // إذا لم يكن هناك تسجيل دخول ولم يكن إجازة
                $attendanceData[] = [
                    'date' => $date,
                    'status' => 'Off Day',
                    'work_hours' => '00:00'
                ];
            }
        }

        return response()->json(['attendance' => $attendanceData]);
    }


    // Create a new check-in
    public function store(Request $request, $companyCode)
    {
        $company = Company::where('company_code', $companyCode)->first();
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'check_in' => 'required|date',
            'location_in' => 'required|string',
            'latitude_in' => 'nullable|numeric',
            'longitude_in' => 'nullable|numeric',
            'location_out' => 'nullable|string',
            'latitude_out' => 'nullable|numeric',
            'longitude_out' => 'nullable|numeric',
            'check_out' => 'nullable|date',
        ]);

        $checkIn = CheckIn::create(array_merge(
            $request->only([
                'user_id', 'check_in', 'location_in', 'latitude_in',
                'longitude_in', 'location_out', 'latitude_out',
                'longitude_out', 'check_out'
            ]),
            ['company_id' => $company->id]
        ));

        return response()->json($checkIn, 201);
    }

    // Show details of a specific check-in
    public function show($companyCode, $id)
    {
        $company = Company::where('company_code', $companyCode)->first();
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $checkIn = CheckIn::where('company_id', $company->id)->where('id', $id)->first();

        if (!$checkIn) {
            return response()->json(['message' => 'Check-in not found'], 404);
        }

        return response()->json($checkIn);
    }


    public function update(Request $request, $companyCode, $id)



{ $company = Company::where('company_code', $companyCode)->first();
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }
    $checkIn = CheckIn::where('company_id', $company->id)->where('id', $id)->first();

    if (!$checkIn) {
        return response()->json(['message' => 'Check-in not found'], 404);
    }

    $request->validate([
        'user_id' => 'required|exists:users,id',
        'check_in' => 'required|date',
        'location_in' => 'required|string',
        'latitude_in' => 'nullable|numeric',
        'longitude_in' => 'nullable|numeric',
        'location_out' => 'nullable|string',
        'latitude_out' => 'nullable|numeric',
        'longitude_out' => 'nullable|numeric',
        'check_out' => 'nullable|date',
    ]);

    $checkIn->update($request->all());

    return response()->json($checkIn);
}


    // Delete a check-in
    public function destroy($companyCode, $id)
    {
        $company = Company::where('company_code', $companyCode)->first();
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        $checkIn = CheckIn::where('company_id', $company->id)->find($id);

        if (!$checkIn) {
            return response()->json(['message' => 'Check-in not found'], 404);
        }

        $checkIn->delete();

        return response()->json(['message' => 'Check-in deleted successfully']);
    }
}


public function index(Request $request, $companyCode)
{
    // Find the company by its company_code
    $company = Company::where('company_code', $companyCode)->first();

    // If the company doesn't exist, return an error response
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    // Start the query for CheckIns associated with the company
    $query = CheckIn::where('company_id', $company->id);

    // Apply filters based on request parameters
    if ($request->has('start_date') && $request->has('end_date')) {
        $query->whereBetween('check_in', [$request->start_date, $request->end_date]);
    }

    if ($request->has('month')) {
        $month = $request->month;
        $query->whereMonth('check_in', '=', date('m', strtotime($month)))
              ->whereYear('check_in', '=', date('Y', strtotime($month)));
    }

    if ($request->has('user_id')) {
        $query->where('user_id', $request->user_id);
    }

    if ($request->has('department')) {
        $query->where('department_id', $request->department);
    }

    if ($request->has('check_in_time')) {
        $query->where('check_in', '>=', $request->check_in_time);
    }

    if ($request->has('check_out_time')) {
        $query->where('check_out', '<=', $request->check_out_time);
    }

    // Paginate the result
    $checkIns = $query->paginate(10);

    return response()->json($checkIns);
}

public function dailyCheckIns(Request $request, $companyCode)
{
    // Find the company by its company_code
    $company = Company::where('company_code', $companyCode)->first();

    // If the company doesn't exist, return an error response
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    // Start the query for CheckIns associated with the company
    $query = CheckIn::where('company_id', $company->id);

    // Filter by the current date or a provided 'date'
    $date = $request->input('date', now()->toDateString());
    $query->whereDate('check_in', $date);

    // Execute the query to get the results with pagination
    $checkIns = $query->with('user')->paginate(10);

    // Return the paginated check-ins as JSON response
    return response()->json($checkIns);
}




// Filter check-ins by user and date range
public function filterByUserAndDate(Request $request, $companyCode)
{
    $company = Company::where('company_code', $companyCode)->first();
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    $query = CheckIn::where('company_id', $company->id);

    if ($request->has('user_id')) {
        $query->where('user_id', $request->user_id);
    }

    if ($request->has('start_date') && $request->has('end_date')) {
        $query->whereBetween('check_in', [
            Carbon::parse($request->start_date),
            Carbon::parse($request->end_date),
        ]);
    }

    $checkIns = $query->get();

    return response()->json($checkIns);
}
public function checkIn(Request $request, $id)
{
    $user = User::select('id', 'company_id', 'department_id', 'attendtaby')
                ->with('department:id,latitude,longitude')
                ->find($id);
    if (!$user) return response()->json(['error' => 'User not found'], 404);

    $today = now()->toDateString();
    if (CheckIn::where('user_id', $id)->whereDate('check_in', $today)->whereNull('check_out')->exists()) {
        return response()->json(['error' => 'You have already checked in today without checking out'], 404);
    }

    // التحقق من وجود إحداثيات الموقع دائمًا
    if (!$request->has(['latitude_in', 'longitude_in'])) {
        return response()->json(['error' => 'Latitude and Longitude are required'], 400);
    }

    $latitude = floatval($request->input('latitude_in'));
    $longitude = floatval($request->input('longitude_in'));

    if ($user->attendtaby === 'dep location' && $user->department) {
        $distance = $this->haversineGreatCircleDistance($user->department->latitude, $user->department->longitude, $latitude, $longitude);
        if ($distance > 0.1) {
            return response()->json(['error' => 'Location too far', 'distance_difference' => $distance - 0.1], 400);
        }
    }

    $checkIn = CheckIn::create([
        'company_id' => $user->company_id,
        'user_id' => $id,
        'check_in' => now(),
        'location_in' => $request->input('location_in'),
        'latitude_in' => $latitude,
        'longitude_in' => $longitude,
    ]);

    return response()->json(['success' => 'Checked in successfully', 'data' => $checkIn], 200);
}
public function checkOut(Request $request, $id)
{
    $user = User::select('id', 'department_id', 'attendtaby')
                ->with('department:id,latitude,longitude')
                ->find($id);
    if (!$user) return response()->json(['error' => 'User not found'], 404);

    $lastCheckIn = CheckIn::where('user_id', $id)->latest()->first();
    if (!$lastCheckIn || $lastCheckIn->check_out) {
        return response()->json(['error' => $lastCheckIn ? 'You have already checked out' : 'No check-in record found'], 400);
    }

    // التحقق من وجود إحداثيات الموقع دائمًا
    if (!$request->has(['latitude_out', 'longitude_out'])) {
        return response()->json(['error' => 'Latitude and Longitude are required'], 400);
    }

    $latitude = floatval($request->input('latitude_out'));
    $longitude = floatval($request->input('longitude_out'));

    if ($user->attendtaby === 'dep location' && $user->department) {
        $distance = $this->haversineGreatCircleDistance($user->department->latitude, $user->department->longitude, $latitude, $longitude);
        if ($distance > 0.1) {
            return response()->json(['error' => 'Location too far', 'distance_difference' => $distance - 0.1], 400);
        }
    }

    $lastCheckIn->update([
        'check_out' => now(),
        'location_out' => $request->input('location_out'),
        'latitude_out' => $latitude,
        'longitude_out' => $longitude,
    ]);

    return response()->json(['success' => 'Checked out successfully', 'data' => $lastCheckIn], 200);
}

    private function haversineGreatCircleDistance($lat1, $lon1, $lat2, $lon2, $earthRadius = 6371)
    {
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $dLat = $lat2 - $lat1;
        $dLon = $lon2 - $lon1;

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos($lat1) * cos($lat2) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
}public function checkStatus($userid)
{
    $user = User::find($userid);
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    $today = now()->toDateString();

    $checkIn = CheckIn::where('user_id', $userid)
                      ->whereDate('check_in', $today)
                      ->first();

    // إذا كان هناك check-out فاعتباره غير مسجل حضور
    $isCheckedIn = $checkIn && !$checkIn->check_out;
    $isCheckedOut = $checkIn && $checkIn->check_out;

    // إذا كان في حالة خروج وأيضا في حالة دخول، اعتبره "غير مسجل"
    if ($isCheckedOut && $isCheckedIn) {
        $isCheckedIn = false;
        $isCheckedOut = false;
    }

    return response()->json([
        'isCheckedIn' => $isCheckedIn,
        'isCheckedOut' => $isCheckedOut
    ]);
}

public function getNotifications($companyCode)
{
    $company = Company::where('company_code', $companyCode)->first();

    if (!$company) {
        return response()->json(['message' => 'Company not found'], 404);
    }

    // Get pending leave requests
    $pendingRequests = LeaveRequest::where('company_id', $company->id)
        ->where('status', 'pending')
        ->with('user:id,first_name,last_name')
        ->get();

    // Get users who checked in but missed the checkout (check_out is null)
    $missingCheckOuts = CheckIn::where('company_id', $company->id)
        ->whereNull('check_out') // Ensure there's no check-out recorded
        ->whereDate('check_in', '<', now()->toDateString()) // Ensure check-in is before today
        ->with('user:id,first_name,last_name') // Include user info
        ->get(); // These users need to be notified

    return response()->json([
        'pending_leave_requests' => $pendingRequests,
        'missed_check_ins' => $missingCheckOuts, // Users who missed check-out
  
    ]);
}

}
