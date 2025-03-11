<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response {
        $user = $request->user();

        // تحقق من أن المستخدم موثوق به ولديه توكن `super-admin`
        if (!$user || !$user->tokenCan('super-admin')) {
            return response()->json(['error' => 'Unauthorized. Only Super Admins can access this.'], 403);
        }

        return $next($request);
    }
}
