<?php
// app/Models/Company.php

namespace App\Models;
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasApiTokens;

    protected $fillable = [
        'name',
         'company_code',
          'password',
          'additional_information',
          'image_path',
          'status',
    ];


    public function users()
    {
        return $this->hasMany(User::class, 'company_id');
    }

    public function departments()
{
    return $this->hasMany(Department::class, 'company_id');

}
public function role()
{
    return $this->hasMany(Role::class, 'company_id');
}
public function leaveRequests()
{
    return $this->hasMany(LeaveRequest::class);
}
public function checkIns()
{
    return $this->hasMany(CheckIn::class);
}
    public function settings()
    {
        return $this->hasOne(CompanySetting::class);
    }
    
public function salarys()
{
    return $this->hasMany(Salary::class);
}
}
