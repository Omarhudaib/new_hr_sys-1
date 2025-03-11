<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class VerifyCompanyAndUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next)
    {
        // Get the companyId from the route parameter
        $companyIdFromRequest = $request->route('companyId');

        // Get the companyId from the authenticated user (from the token)
        $companyIdFromToken = auth()->user()->company_id;

        // Check if the companyId in the request matches the companyId in the token
        if ($companyIdFromRequest != $companyIdFromToken) {
            return response()->json(['error' => 'Unauthorized: Company mismatch'], 403);
        }

        return $next($request);
    }
}
