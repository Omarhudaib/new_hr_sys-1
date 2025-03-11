<?php
namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LeaveRequestController extends Controller
{ public function submitRequest(Request $request, $id)
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048', // Validate the image
        ]);

        // Assign company ID from the route parameter
        $validated['company_id'] = $id;

        // Handle file upload if present
        if ($request->hasFile('image')) {
            $filePath = $request->file('image')->store('leave_images', 'public');
            $validated['image_path'] = $filePath; // Store the file path
        }

        // Save the leave request to the database
        $leaveRequest = LeaveRequest::create([
            'user_id' => $validated['user_id'],
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'] ?? null,
            'company_id' => $validated['company_id'],
            'status' => 'Pending', // Default status
            'image_path' => $validated['image_path'] ?? null, // Optional image field
        ]);

        // Return a success response
        return response()->json([
            'success' => true,
            'message' => 'Request submitted successfully!',
            'data' => $leaveRequest,
        ], 200);
    }


    public function UserRequest($id)
{
    $leaveRequests = LeaveRequest::where('user_id', $id)
        ->with('leaveType') // Eager load the leaveType relationship
        ->get();

    return response()->json($leaveRequests);
}

public function index(Request $request, $companyCode)
{
    $company = Company::where('company_code', $companyCode)->first();

    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }

    // Get the status filter from the query string, if provided
    $status = $request->query('status'); // 'status' is the query parameter
    $validStatuses = ['pending', 'approved', 'rejected']; // Define valid statuses

    // Start the query builder
    $query = LeaveRequest::where('company_id', $company->id)
                         ->with(['user', 'leaveType']);

    // Apply the status filter if it's valid
    if ($status && in_array($status, $validStatuses)) {
        $query->where('status', $status);
    }

    // Apply pagination with 10 items per page
    $leaveRequests = $query->paginate(10);

    return response()->json($leaveRequests->items()); // This returns only the actual items without pagination info.

}


    public function store(Request $request, $companyCode)
    {
        // Fetch the company
        $company = Company::where('company_code', $companyCode)->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Validate the request
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:pending,approved,rejected',
            'reason' => 'nullable|string',
            'image' => 'nullable|file|mimes:jpg,png,jpeg|max:4048',
        ]);

        // Handle file upload
        if ($request->hasFile('image')) {
            $filePath = $request->file('image')->store('leave_images', 'public');
            $validatedData['image_path'] = $filePath;
        }

        // Add company ID to the validated data
        $validatedData['company_id'] = $company->id;

        // Create the leave request
        $leaveRequest = LeaveRequest::create($validatedData);

        return response()->json($leaveRequest, 201);
    }
    public function update(Request $request, $companyCode, $id)
    {
        Log::debug('Updating Leave Request', ['companyCode' => $companyCode, 'leaveRequestId' => $id]);

        $company = Company::where('company_code', $companyCode)->firstOrFail();
        $leaveRequest = LeaveRequest::where('id', $id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        // Updated validation rules
        $validated = $request->validate([
            'leave_type_id' => [
                'sometimes',
                'required_without:leave_type_name',
                Rule::exists('leave_types', 'id')->where('company_id', $company->id)
            ],
            'leave_type_name' => [
                'sometimes',
                'required_without:leave_type_id',
                Rule::exists('leave_types', 'name')->where('company_id', $company->id)
            ],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:pending,approved,rejected',
            'reason' => 'nullable|string',
        ]);

        // Resolve leave type
        $leaveType = $request->has('leave_type_id') ?
            LeaveType::where('id', $validated['leave_type_id'])
                     ->where('company_id', $company->id)
                     ->firstOrFail()
            :
            LeaveType::where('name', $validated['leave_type_name'])
                     ->where('company_id', $company->id)
                     ->firstOrFail();

// Handle approval logic
if ($validated['status'] === 'approved' && $leaveRequest->status !== 'approved') {
    $user = $leaveRequest->user;

    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    $startDate = Carbon::parse($validated['start_date']);
    $endDate = Carbon::parse($validated['end_date']);

    // Ensure valid working days calculation
    $days = $this->calculateWorkingDays($startDate, $endDate, $user->holidays);
    if ($days <= 0) {
        return response()->json(['error' => 'Invalid leave days calculation'], 400);
    }

    // Ensure leave type has a valid deduction field
    if (!isset($leaveType->name)) {
        return response()->json(['error' => 'Deduction field is missing for leave type'], 400);
    }

    $deductionField = $leaveType->name;

    // Ensure the user has the deduction field
    if (!isset($user->{$deductionField})) {
        return response()->json(['error' => "Deduction field '{$deductionField}' does not exist for user"], 400);
    }

    $availableDays = (int) $user->{$deductionField};

    Log::info('Leave Approval Check', [
        'user_id' => $user->id,
        'deduction_field' => $deductionField,
        'available_days' => $availableDays,
        'requested_days' => $days
    ]);

    if ($availableDays >= $days) {
        $user->{$deductionField} = max(0, $availableDays - $days);
        $user->save();
    } else {
        return response()->json([
            'error' => "Not enough {$leaveType->name} days available"
        ], 400);
    }
}


        // Update with resolved leave type
        $leaveRequest->update([
            'leave_type_id' => $leaveType->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'],
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Leave request updated successfully',
            'data' => [
                'leave_request' => $leaveRequest,
                'leave_type_name' => $leaveType->name
            ]
        ], 200);
    }

    private function calculateWorkingDays($startDate, $endDate, $holidays)
    {
        $holidayDates = collect(explode(',', $holidays))->map(fn($date) => trim($date));

        return $startDate->diffInDaysFiltered(function ($date) use ($holidayDates) {
            return !$holidayDates->contains($date->toDateString());
        }, $endDate);
    }

    // Delete a leave request
    public function destroy($companyCode, $id)
    {
        // Fetch the company by company_code
        $company = Company::where('company_code', $companyCode)->first();

        // Check if the company exists
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        // Find the leave request
        $leaveRequest = LeaveRequest::find($id);
        if (!$leaveRequest) {
            return response()->json(['message' => 'Leave request not found'], 404);
        }

        // Check if the user belongs to the company
        $user = User::where('id', $leaveRequest->user_id)
                    ->where('company_id', $company->id)
                    ->first();

        if (!$user) {
            return response()->json(['error' => 'User does not belong to the specified company'], 404);
        }

        // Delete the image if it exists
        if ($leaveRequest->image_path && Storage::exists('public/' . $leaveRequest->image_path)) {
            Storage::delete('public/' . $leaveRequest->image_path);
        }

        // Delete the leave request
        $leaveRequest->delete();

        return response()->json(['message' => 'Leave request deleted successfully']);
    }





}
