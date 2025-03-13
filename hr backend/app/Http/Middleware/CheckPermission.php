<?php

namespace App\Http\Middleware;


use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class CheckPermission
{


    public function handle(Request $request, Closure $next, $permission)
{
    $user = Auth::guard('sanctum')->user();

if (!$user instanceof \App\Models\User) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
    // إذا كان المستخدم غير موجود، قم بإرجاع خطأ
    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // تحميل الصلاحيات للمستخدم
    $user->load('permissions'); // تحميل الصلاحيات مع المستخدم

    // تحقق مما إذا كان المستخدم يملك الصلاحية
    if (!$user->hasPermission($permission)) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // إذا كان كل شيء صحيحًا، أكمل الطلب
    return $next($request);
}

}

