<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepartmentAdmin extends Model
{
    protected $fillable = ['user_id', 'department_id', 'company_id']; // إضافة company_id

    // علاقة مع موديل اليوزر
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // علاقة مع موديل القسم
    public function departments()
    {
        return $this->belongsToMany(Department::class, 'department_admins', 'user_id', 'department_id')
                    ->wherePivot('company_id', $this->company_id); // استخدم wherePivot لتحديد الشركة بناءً على الـ pivot table
    }


    // علاقة مع موديل الشركة
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
