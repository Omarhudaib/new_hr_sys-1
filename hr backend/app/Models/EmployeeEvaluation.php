<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeEvaluation extends Model
{
    use HasFactory;
    protected $table = 'employee_evaluations';
    protected $fillable = ['user_id', 'department_id', 'company_id', 'rating', 'comments', 'evaluated_by', 'evaluation_date'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function department() {
        return $this->belongsTo(Department::class);
    }

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function evaluator() {
        return $this->belongsTo(User::class, 'evaluated_by');
    }

}
