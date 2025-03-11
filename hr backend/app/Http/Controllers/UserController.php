<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // List all users for the same company as the authenticated user
    public function index($companyCode)
    {
        try {
            // Retrieve the company by its company_code
            $company = Company::where('company_code', $companyCode)->first();

            if (!$company) {
                return response()->json(['error' => 'Company not found'], 404);
            }

            // Fetch users from the database by company_id
            $users = User::with(['role', 'department'])
                        ->where('company_id', $company->id)
                        ->get();

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch users', 'message' => $e->getMessage()], 500);
        }
    }



    public function show($companyCode, $id)
    {
        try {
            // Retrieve the company by its company_code
            $company = Company::where('company_code', $companyCode)->first();

            if (!$company) {
                return response()->json(['error' => 'Company not found'], 404);
            }

            // Fetch the user by company_id and user id
            $user = User::with(['role', 'department'])
                        ->where('company_id', $company->id)  // Ensure the user belongs to the company
                        ->findOrFail($id);  // Find the user by ID, or fail if not found

            return response()->json($user, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user', 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
// Validate the incoming request data
$validated = $request->validate([
    'first_name' => 'required|string|max:255',
    'last_name' => 'required|string|max:255',
    'user_code' => 'required|string|unique:users,user_code',
    'password' => 'required|string|min:8',
    'role_id' => 'required|integer|exists:role,id',
    'department_id' => 'nullable|integer|exists:departments,id',
    'additional_information' => 'nullable|string',
    'second_name' => 'nullable|string|max:255',
    'middle_name' => 'nullable|string|max:255',
    'image_path' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:4048',
    'national_id' => 'nullable|string|max:20',
    'marital_status' => 'nullable|string|in:single,married,divorced,widowed',
    'attendtaby' => 'nullable|in:any location,dep location',
    'date_of_birth' => 'nullable|date',
    'holidays' => 'nullable|integer',
    'salary' => 'nullable|numeric',
    'sick_days' => 'nullable|integer',
    'annual_vacations_days' => 'nullable|integer',
    'company_id' => 'required|integer|exists:companies,id',
    'work_type' => 'nullable|in:normal,hazardous',
]);

            // Hash the password before storing it
            $validated['password'] = bcrypt($validated['password']);

            // Handle image upload
            if ($request->hasFile('image_path')) {
                // Store the image in the 'public/users' directory
                $imagePath = $request->file('image_path')->store('users', 'public');
                $validated['image_path'] = $imagePath; // Save the path to the database
            } else {
                $validated['image_path'] = null; // No image uploaded
            }
            $user = new User();
            $user->first_name = $validated['first_name'];
            $user->last_name = $validated['last_name'];
            $user->user_code = $validated['user_code'];
            $user->password = $validated['password'];
            $user->role_id = $validated['role_id'];
            $user->department_id = $validated['department_id'] ?? null;
            $user->additional_information = $validated['additional_information'] ?? null;
            $user->second_name = $validated['second_name'] ?? null;
            $user->middle_name = $validated['middle_name'] ?? null;
            $user->image_path = $validated['image_path']; // Save the image path
            $user->national_id = $validated['national_id'] ?? null;
            $user->marital_status = $validated['marital_status'] ?? null;
            $user->attendtaby = $validated['attendtaby'] ?? null;
            $user->date_of_birth = $validated['date_of_birth'] ?? null;
            $user->holidays = $validated['holidays'] ?? null;
            $user->salary = $validated['salary'] ?? null;
            $user->sick_days = $validated['sick_days'] ?? null;
            $user->annual_vacations_days = $validated['annual_vacations_days'] ?? null;
            $user->company_id = $validated['company_id'];
            $user->work_type = $validated['work_type'] ?? null;
            $user->save();

            // Return a success response
            return response()->json(['message' => 'User created successfully', 'user' => $user], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors if it's a validation exception
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),  // Include validation errors
            ], 422);
        } catch (\Exception $e) {
            // Log and return error response in case of any exception
            Log::error('Failed to create user', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json(['error' => 'Failed to create user', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request)
    {
        Log::info('Request data:', $request->all());

        try {
            // Extract id and company_code from the request
            $id = $request->input('id');
            $company_code = $request->input('company_code');  // You can still use this if you need it for logging or other purposes

            // Find the company by company_code
            $company = Company::where('company_code', $company_code)->first();

            // If the company does not exist, return an error
            if (!$company) {
                return response()->json(['error' => 'Company not found'], 404);
            }

            // Log the company and id being queried
            Log::info('Looking for user with id: ' . $id);

            // Find the user by user id only, ignoring the company_id
            $user = User::where('id', $id)->first();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Validate the incoming request data
            $validated = $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'user_code' => 'nullable|string',
                'role_id' => 'nullable|integer|exists:role,id',
                'department_id' => 'nullable|integer|exists:departments,id',
                'password' => 'nullable|string|min:8',
                'additional_information' => 'nullable|string',
                'second_name' => 'nullable|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4048',
                'national_id' => 'nullable|string|max:20',
                'marital_status' => 'nullable|string|in:single,married,divorced',
                'attendtaby' => 'nullable|in:any location,dep location',
                'date_of_birth' => 'nullable|date',
                'holidays' => 'nullable|integer',
                'salary' => 'nullable|numeric',
                'sick_days' => 'nullable|integer',
                'annual_vacations_days' => 'nullable|integer',
                'company_id' => 'nullable|integer|exists:companies,id',
                'work_type' => 'nullable|in:normal,hazardous',
            ]);

            // If password is provided, hash it
            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            // Handle image upload
            if ($request->hasFile('image_path')) {
                // Delete the old image if it exists
                if ($user->image_path) {
                    Storage::disk('public')->delete($user->image_path);
                }

                // Store the new image in the 'public/users' directory
                $imagePath = $request->file('image_path')->store('users', 'public');
                $validated['image_path'] = $imagePath;
            } else {
                $validated['image_path'] = $user->image_path;
            }

            // Ensure company_id is set from the company we fetched
            $validated['company_id'] = $company->id;

            // Update the user with the validated data
            $user->update($validated);

            return response()->json(['message' => 'User updated successfully', 'user' => $user], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'             => 'Validation failed',
                'message'           => 'The provided data is invalid',
                'validation_errors' => $e->errors(),
                'request_data'      => $request->all()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update user', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update user', 'message' => $e->getMessage()], 500);
        }
    }


    // Delete a user only if they belong to the same company as the authenticated user
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete(); // Delete the user

            return response()->json(['message' => 'User deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['message' => 'Error deleting user: ' . $e->getMessage()], 500);
        }

 }
 public function updateUserData(Request $request, $userid)
{
    try {
        Log::info('Request received:', $request->all()); // ✅ سجل البيانات الواردة

        $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6|confirmed',
            'second_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'national_id' => 'nullable|string|max:20',
            'marital_status' => 'nullable|string|in:single,married,divorced',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = User::find($userid);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update($request->only([
            'first_name', 'last_name', 'second_name', 'middle_name', 'national_id', 'marital_status'
        ]));

        if ($request->has('password') && !empty($request->password)) {
            $user->password = bcrypt($request->password);
            $user->save();
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('profile_images', 'public');
            $user->image_path = $imagePath;
            $user->save();
        }

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    } catch (\Exception $e) {
        Log::error('Error updating user:', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to update user', 'message' => $e->getMessage()], 500);
    }
}


 public function getUserData($id)
{
    try {
        $user = User::find($id);
        return $user ? response()->json($user) : response()->json(['error' => 'User not found'], 404);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch data', 'message' => $e->getMessage()], 500);
    }
}

public function updatePassword(Request $request, $id)
{
    try {
        // Find the user by ID
        $user = User::find($id);

        // Return error if user not found
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Validate the input
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        // Check if the current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 400);
        }

        // Update the password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    } catch (\Exception $e) {
        // Return error message in case of failure
        return response()->json(['error' => 'Failed to update password', 'message' => $e->getMessage()], 500);
    }
}


}
