<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Company;
use App\Models\User;
use App\Models\CheckIn;
use App\Models\LeaveRequest;
use Illuminate\Support\Facades\Cache;

class ProcessSummaryReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $companyCode, $standardHours, $month, $year;

    /**
     * Create a new job instance.
     */
    public function __construct($companyCode, $standardHours, $month, $year)
    {
        $this->companyCode = $companyCode;
        $this->standardHours = $standardHours;
        $this->month = $month;
        $this->year = $year;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        Log::info("بدء معالجة تقرير الحضور لشركة {$this->companyCode} لشهر {$this->month}/{$this->year}");

        $company = Company::where('company_code', $this->companyCode)->first();

        if (!$company) {
            Log::error("لم يتم العثور على الشركة برمز: {$this->companyCode}");
            return;
        }

        $standardHours = $this->standardHours ?? $company->standard_hours ?? 8;
        $users = User::where('company_id', $company->id)->get();

        if ($users->isEmpty()) {
            Cache::put("summary_{$this->companyCode}_{$this->month}_{$this->year}", []);
            return;
        }

        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $this->month, $this->year);

        $result = $users->map(function ($user) use ($daysInMonth, $standardHours) {
            $totalHours = 0;
            $dailyData = [];

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $date = sprintf('%04d-%02d-%02d', $this->year, $this->month, $day);

                $checkIn = CheckIn::where('user_id', $user->id)->whereDate('check_in', $date)->first();
                $checkOut = $checkIn ? CheckIn::where('user_id', $user->id)->whereDate('check_out', $date)->first() : null;

                $leaveRequest = LeaveRequest::where('user_id', $user->id)
                    ->whereDate('start_date', '<=', $date)
                    ->whereDate('end_date', '>=', $date)
                    ->where('status', 'approved')
                    ->exists();

                $workedHours = $checkIn && $checkOut ? round((strtotime($checkOut->check_out) - strtotime($checkIn->check_in)) / 3600, 2) : 0;

                $dailyData[] = [
                    'date' => $date,
                    'check_in' => $checkIn->check_in ?? null,
                    'check_out' => $checkOut->check_out ?? null,
                    'hours_worked' => $workedHours,
                    'status' => $checkIn ? ($checkOut ? 'Checked Out' : 'Checked In') : ($leaveRequest ? 'On Leave' : 'Absent'),
                ];

                $totalHours += $workedHours;
            }

            return [
                'user_id' => $user->id,
                'user_name' => "{$user->first_name} {$user->secand_name} {$user->midel_name} {$user->last_name}",
                'daily_data' => $dailyData,
                'total_hours' => $totalHours,
            ];
        });

        // حفظ النتيجة في Cache لمدة 1 ساعة
        Cache::put("summary_{$this->companyCode}_{$this->month}_{$this->year}", $result, 3600);

        Log::info("تم إنهاء معالجة التقرير لشركة {$this->companyCode}");
    }
}
