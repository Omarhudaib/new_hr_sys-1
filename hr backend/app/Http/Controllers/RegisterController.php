<?php
namespace App\Http\Controllers\Auth;
use App\Models\LeaveType;
use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    /**
     * Handle a registration request for a new company.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        Log::info('Received registration request', $request->all());

        // Validate the incoming request
        $validatedData = $request->validate([
            'company_name' => 'required|string|max:255|unique:companies,name',
            'company_code' => 'required|string|unique:companies,company_code',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'additional_information' => 'nullable|string',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Validates image uploads
        ]);

        try {
            Log::info('Validation passed');

            // Handle image upload if provided
            $imagePath = null;
            if ($request->hasFile('image_path')) {
                $imagePath = $request->file('image_path')->store('company_images', 'public');
            }

            // Create the company
            Log::info('Creating company', ['company_name' => $validatedData['company_name']]);

            $company = Company::create([
                'name' => $validatedData['company_name'],
                'company_code' => $validatedData['company_code'],
                'password' => Hash::make($validatedData['password']),
                'additional_information' => $validatedData['additional_information'] ?? null,
                'image_path' => $imagePath,
                'status' => 'inactive', // Default status for new companies
            ]);

            Log::info('Company created successfully', ['company' => $company]);




LeaveType::create([
     'company_id'=>$company->id,
    'name' => 'sick_days',
    'description' => 'Leave taken for personal illness or medical reasons',
    'status' => 'active',
]);

LeaveType::create([
    'company_id'=>$company->id,
    'name' => 'annual_vacations_days',
    'description' => 'Leave taken for personal holidays or vacation',
    'status' => 'active',
]);

LeaveType::create([
    'company_id'=>$company->id,
    'name' => 'holidays',
    'description' => 'Leave taken for unforeseen personal reasons',
    'status' => 'active',
]);
            // Create a token for the company
            $token = $company->createToken('API Token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Company registered successfully!',
                'company' => $company,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Company Registration Error: '.$e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



}
