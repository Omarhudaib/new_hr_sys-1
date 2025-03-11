<?php
// app/Models/LeaveType.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model

{
    protected $table = 'leave_types';
    protected $fillable = ['company_id','name', 'description','status'];

    // Relationship with leave requests
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
