<?php
namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Company;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // Fetch roles for the company identified by $companyCode
    public function index($companyCode)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $roles = Role::where('company_id', $company->id)->get();

        if ($roles->isEmpty()) {
            return response()->json(['message' => 'No roles found for this company'], 404);
        }

        return response()->json($roles);
    }

    // Create a new role
    public function store(Request $request, $companyCode)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id', // Validate the company ID
        ]);

        $role = Role::create($validated);
        return response()->json($role, 201); // Return the created role
    }

    // Show a specific role by ID
    public function show($companyCode, $id)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        // Fetch the role for this company
        $role = Role::where('company_id', $company->id)->find($id);

        if (!$role) {
            return response()->json(['error' => 'Role not found for this company'], 404);
        }

        return response()->json($role);
    }

    // Update the role
    public function update(Request $request, $companyCode, $id)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $role = Role::where('company_id', $company->id)->find($id);

        if (!$role) {
            return response()->json(['message' => 'Role not found for this company'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $role->update($validated);
        return response()->json($role); // Return updated role
    }

    // Delete a role
    public function destroy($companyCode, $id)
    {
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $role = Role::where('company_id', $company->id)->find($id);

        if (!$role) {
            return response()->json(['message' => 'Role not found for this company'], 404);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }
}
