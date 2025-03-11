<?php
// app/Models/CheckIn.php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'user_id', 'check_in', 'location_in',
        'latitude_in', 'longitude_in', 'location_out',
        'latitude_out', 'longitude_out', 'check_out'
    ];
    // Relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
 

}
