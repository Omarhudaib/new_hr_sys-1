<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['dep_name', 'company_id','loc_name','latitude','longitude']; // Add company_id if not already present

    public function users()
    {
        return $this->hasMany(User::class, 'department_id'); // Assuming 'department_id' is the foreign key in users table
    }
    public function company()
    {
        return $this->belongsTo(Company::class); // Each department belongs to a company
    }
}

