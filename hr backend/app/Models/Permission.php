<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    // علاقة مع المستخدمين عبر جدول user_permissions
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permissions')
                    ->withPivot('company_id')
                    ->withTimestamps();
    }
}
