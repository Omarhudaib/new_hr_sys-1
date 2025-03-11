<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens;

    // Fillable fields for mass assignment
    protected $fillable = [
        'company_id',
        'role_id',
        'department_id',
        'password',
        'user_code',
        'additional_information',
        'first_name',
        'second_name',
        'middle_name',
        'last_name',
        'image_path',
        'national_id',
        'marital_status',
        'attendtaby',
        'date_of_birth',
        'holidays',
        'salary',
        'sick_days',
        'annual_vacations_days',
        'work_type',
    ];

    // Fields to hide in the model's array and JSON form
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relationship with the Company model
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Relationship with the CheckIn model
    public function checkin()
    {
        return $this->hasMany(CheckIn::class);
    }
    public function checkIns() {
        return $this->hasMany(CheckIn::class);  // تحقق من اسم الموديل والعمود
    }


    // Relationship with the Department model
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id'); // Assuming 'department_id' is the foreign key
    }

    // Relationship with the Role model
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id'); // Assuming 'role_id' is the foreign key
    }
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class, 'user_id');
    }

public function salarys()
{
    return $this->hasOne(Salary::class);
}


}
