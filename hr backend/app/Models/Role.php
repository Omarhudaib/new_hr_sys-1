<?php
// app/Models/Role.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Role extends Model
{
    protected $table = 'role';
    protected $fillable = ['name', 'company_id']; // Add company_id if not already present

    public function users()
    {
        return $this->hasOne(User::class); // Many users can share the same role
    }

    public function company()
    {
        return $this->belongsTo(Company::class); // Each role belongs to a company
    }
}

