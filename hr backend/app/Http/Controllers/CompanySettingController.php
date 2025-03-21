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

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $settings = CompanySetting::where('company_id', $company->id)->firstOrFail();
        return response()->json($settings);
    }

    public function update(Request $request, $companyCode)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        $settings = CompanySetting::where('company_id', $company->id)->firstOrFail();

        $validated = $request->validate([
            'work_hours' => 'nullable|integer|min:1|max:24',
            'overtime_rate' => 'nullable|numeric|min:0',
            'overtime_enabled' => 'nullable|boolean',
            'style' => 'nullable|string|in:default,modern,classic,dark,light,blue,green,red,yellow,purple,pink',
            'frequency' => 'nullable|string|in:daily,weekly,monthly'
        ]);

        $settings->update($validated);

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
