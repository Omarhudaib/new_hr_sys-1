<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;


class CheckCompanyMiddleware
{

public function checkCompanyCodeMatch(Request $request, $token)
{
    // العثور على التوكن بناءً على القيمة المدخلة
    $accessToken = PersonalAccessToken::findToken($token);

    if (!$accessToken) {
        return response()->json(['error' => 'Invalid token'], 401);
    }

    // التحقق إذا كان التوكن مرتبطًا بشركة
    if ($accessToken->tokenable_type === Company::class) {
        // الحصول على الشركة المرتبطة بالتوكن
        $company = $accessToken->tokenable;

        // إرجاع رمز الشركة من التوكن
        $companyCodeFromToken = $company->company_code;

        // الحصول على company_code من الـ route
        $routeCompanyCode = $request->route('company_code');

        // التحقق من تطابق company_code من التوكن مع الـ route
        if ($companyCodeFromToken !== $routeCompanyCode) {
            return response()->json(['error' => 'Company code mismatch'], 403);
        }

        // إذا كان الكود متطابقًا، إرجاع استجابة ناجحة
        return response()->json([
            'status' => 'success',
            'message' => 'Company codes match'
        ], 200);
    }

    return response()->json(['error' => 'Token does not belong to a company'], 403);
}

}
