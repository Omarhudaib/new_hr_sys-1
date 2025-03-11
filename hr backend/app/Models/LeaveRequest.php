<?php
// app/Models/LeaveRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
       'company_id', 'user_id', 'leave_type_id', 'start_date', 'end_date', 'status', 'reason','image_path'
    ];


    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
