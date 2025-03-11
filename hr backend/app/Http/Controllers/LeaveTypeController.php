<?php
namespace App\Http\Controllers;

use App\Models\LeaveType;
use App\Models\Company;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Queue;

class LeaveTypeController extends Controller
{
    /**
     * Fetch leave types for the given companyCode.
     */
    public function index($companyCode)
    {
        // Fetch the company by companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Fetch leave types for the company
        $leaveTypes = LeaveType::where('company_id', $company->id)->get();

        // Check if there are no leave types
        if ($leaveTypes->isEmpty()) {
            return response()->json(['message' => 'No leave types found'], 404);
        }

        // Return leave types for the company
        return response()->json($leaveTypes);
    }

    /**
     * Store a new leave type for the given companyCode.
     */
    // public function store(Request $request, $companyCode)
    // {
    //     // Fetch the company by companyCode
    //     $company = Company::where('company_code', $companyCode)->first();

    //     // Check if the company exists
    //     if (!$company) {
    //         return response()->json(['error' => 'Company not found'], 404);
    //     }

    //     // Validate the request data
    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'description' => 'nullable|string',
    //         'status' => 'required|in:active,inactive',
    //     ]);

    //     // Create the new leave type for the company
    //     $leaveType = LeaveType::create([
    //         'name' => $request->name,
    //         'description' => $request->description,
    //         'status' => $request->status,
    //         'company_id' => $company->id,  // Use company ID
    //     ]);

    //     return response()->json([
    //         'message' => 'Leave Type created successfully!',
    //         'data' => $leaveType
    //     ], 201);
    // }

    /**
     * Update a leave type for the given companyCode and leave type ID.
     */
    public function update(Request $request, $companyCode, $id)
    {
        // Fetch the company by companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Find the leave type by ID
        $leaveType = LeaveType::where('company_id', $company->id)->findOrFail($id);

        // Validate the request data
        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        // Update the leave type
        $leaveType->update($request->all());

        return response()->json([
            'message' => 'Leave Type updated successfully!',
            'data' => $leaveType
        ]);
    }

    /**
     * Show a single leave type for the given companyCode and leave type ID.
     */
    public function show($companyCode, $id)
    {
        // Fetch the company by companyCode
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Fetch the leave type by ID for the company
        $leaveType = LeaveType::where('company_id', $company->id)->findOrFail($id);

        return response()->json($leaveType);
    }

    /**
     * Delete a leave type for the given companyCode and leave type ID.
     */
    // public function destroy($companyCode, $id)
    // {
    //     // Fetch the company by companyCode
    //     $company = Company::where('company_code', $companyCode)->first();

    //     // Check if the company exists
    //     if (!$company) {
    //         return response()->json(['error' => 'Company not found'], 404);
    //     }

    //     // Find the leave type by ID for the company
    //     $leaveType = LeaveType::where('company_id', $company->id)->findOrFail($id);

    //     // Delete the leave type
    //     $leaveType->delete();

    //     return response()->json([
    //         'message' => 'Leave Type deleted successfully!'
    //     ]);
    // }


    function leavetypesu($company_id){
        // Fetch leave types for the company
        $leaveTypes = LeaveType::where('company_id', $company_id)->get();
        return response()->json($leaveTypes);
    }
}
