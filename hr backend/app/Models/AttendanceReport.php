<?php
namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AttendanceReport extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'month',
        'year',
        'total_hours',
        'overtime_hours',
        'delay_hours',
        'total_leaves',
        'final_hours',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

  
}
