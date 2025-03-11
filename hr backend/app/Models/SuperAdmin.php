<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // استخدام Sanctum لإنشاء التوكنات

class SuperAdmin extends Authenticatable {
    use HasFactory, HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'phone', 'token_type'];

    protected $hidden = ['password'];

    public function setPasswordAttribute($value) {
        $this->attributes['password'] = bcrypt($value);
    }
}
