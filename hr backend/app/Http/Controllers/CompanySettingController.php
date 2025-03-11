<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanySettingController extends Controller
{
    public function show($companyCode)
{
    $company = Company::where('company_code', $companyCode)->first();

    // التحقق من وجود الشركة
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    $settings = CompanySetting::where('company_id', $company->id)->firstOrFail();
    return response()->json($settings);
}

public function update(Request $request, $companyCode)
{
    $company = Company::where('company_code', $companyCode)->first();

    // التحقق من وجود الشركة
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    $settings = CompanySetting::where('company_id', $company->id)->firstOrFail();
    $settings->update($request->all());

    return response()->json(['message' => 'Settings updated successfully']);
}

}
