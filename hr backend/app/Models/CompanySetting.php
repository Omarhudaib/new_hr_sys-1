<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'overtime_rate', 'overtime_enabled','work_hours' ,'style'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
