<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, $permission): Response
    {
        // جلب التوكن من الطلب
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized. Token not found'], 401);
        }

        // البحث عن التوكن في جدول personal_access_tokens
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized. Invalid token'], 401);
        }

        // جلب المستخدم المرتبط بالتوكن
        $user = $accessToken->tokenable;

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized. User not found'], 401);
        }

        // جلب الصلاحيات المخزنة في التوكن
        $abilities = $accessToken->abilities ?? [];

        // التحقق مما إذا كان لدى المستخدم الصلاحية المطلوبة
        if (!in_array($permission, $abilities)) {
            return response()->json(['status' => 'error', 'message' => 'Permission denied'], 403);
        }

        return $next($request);
    }
}
