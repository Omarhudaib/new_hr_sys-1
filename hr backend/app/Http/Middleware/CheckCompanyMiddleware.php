<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;

class CheckCompanyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Extract token from the Authorization header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Unauthorized: Missing token'], 401);
        }

        // Attempt to authenticate using the token
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized: Invalid token'], 401);
        }

        // Log authenticated user for debugging
        Log::info('Authenticated User:', ['user' => $user]);

        // Now we can proceed to check the company code and company ID
        $companyCode = $request->header('Company-Code');
        Log::info('Company Code from header:', ['companyCode' => $companyCode]);

        if (!$companyCode) {
            return response()->json(['error' => 'Unauthorized: Missing Company Code'], 401);
        }

        // Find the company using the company_code
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['error' => 'Unauthorized: Invalid Company Code'], 403);
        }

   
        return $next($request);
    }
}

