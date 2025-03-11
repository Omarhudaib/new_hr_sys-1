<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'salary_amount',  // Base salary
        'bonus',          // Calculated overtime pay
        'deductions',     // Sum of delay, insurance, and social security deductions
        'net_salary',     // Final net salary
        'social_security',
        'month',
        'year',
        'overtime_rate',
        'insurance_rate',
        'social_security_rate',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}