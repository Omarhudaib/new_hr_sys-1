<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use App\Models\Company;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    // Get all departments for a company
    public function index($companyCode)
    {
        // Find the company using companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Fetch all departments for the company
        $departments = Department::where('company_id', $company->id)->get();

        return response()->json($departments);
    }

    // Store a new department
    public function store(Request $request, $companyCode)
    {
        // Find the company using companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Validate the incoming request
        $request->validate([
            'dep_name' => 'required|string|max:255',
            'loc_name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Create the department under the found company
        Department::create([
            'company_id' => $company->id,
            'dep_name' => $request->dep_name,
            'loc_name' => $request->loc_name,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json(['message' => 'Department added successfully!']);
    }

    // Show a specific department
    public function show($id, $companyCode)
    {
        // Find the company using companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Find the department by ID and check if it belongs to the company
        $department = Department::where('company_id', $company->id)->findOrFail($id);

        return response()->json($department);
    }

    public function update(Request $request, $companyCode, $id)
    {
        // Log to check the received parameters
        Log::info('Updating Department', ['companyCode' => $companyCode, 'departmentId' => $id]);

        // Find the company using companyCode
        $company = Company::where('company_code', $companyCode)->first();
        if (!$company) {
            Log::error('Company not found', ['companyCode' => $companyCode]);
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Find the department and ensure it belongs to the company
        $department = Department::where('company_id', $company->id)->find($id);
        if (!$department) {
            Log::error('Department not found or does not belong to the company', ['departmentId' => $id, 'companyId' => $company->id]);
            return response()->json(['error' => 'Department not found or does not belong to this company'], 404);
        }

        // Validate the incoming request
        $request->validate([
            'dep_name' => 'required|string|max:255',
            'loc_name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Update the department
        $department->update($request->all());

        return response()->json($department);
    }


    // Delete a department
    public function destroy($companyCode, $id)
    {
        // Find the company using companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Find the department and ensure it belongs to the company
        $department = Department::where('company_id', $company->id)->findOrFail($id);

        // Delete the department
        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
