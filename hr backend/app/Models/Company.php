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
public function departmentAdmins()
{
    return $this->hasMany(DepartmentAdmin::class);
}

public function addDepartmentAdmin($user_id, $department_id)
{
    // استرجاع المستخدم والقسم
    $user = User::find($user_id);
    $department = Department::find($department_id);

    // إذا لم يكن المستخدم أو القسم موجودين، العودة بـ false
    if (!$user || !$department) {
        return false;
    }

    // التحقق من أن القسم والمستخدم يتبعان نفس الشركة
    if ($department->company_id !== $this->id || $user->company_id !== $this->id) {
        return false;
    }

    // إضافة المستخدم كـ DepartmentAdmin مع إضافة company_id
    $department->admins()->create([
        'user_id' => $user_id,
        'department_id' => $department_id,
        'company_id' => $this->id, // إضافة company_id لضمان التحقق من الشركة الصحيحة
    ]);

    return true;
}


}
