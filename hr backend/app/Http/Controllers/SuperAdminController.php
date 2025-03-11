<?php


namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\SuperAdmin;
use App\Models\CheckIn;
use App\Models\CompanySetting;
use App\Models\Department;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;



class SuperAdminController extends Controller
{

    public function indexCompany(Request $request)
    {

        try {
            $companys = Company::with(['users', 'role', 'departments'])->get();
            return response()->json($companys);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch company data', 'message' => $e->getMessage()], 500);
        }
    }

    public function updateCompany(Request $request, $companyCode)
    {


        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'additional_information' => 'nullable|string',
            'image_path' => 'nullable|string',
            'password' => 'nullable|string|min:8',
        ]);

        try {
            $company = Company::where('company_code', $companyCode)->first();
            if (!$company) {
                return response()->json(['error' => 'Company not found'], 404);
            }

            if (!empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }

            $company->update($validatedData);
            return response()->json($company);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update company', 'message' => $e->getMessage()], 500);
        }
    }
    
    public function storeCompany(Request $request)
    {


        Log::info('Received registration request', $request->all());

        $validatedData = $request->validate([
            'company_name' => 'required|string|max:255|unique:companies,name',
            'company_code' => 'required|string|unique:companies,company_code',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'additional_information' => 'nullable|string',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        try {
            Log::info('Validation passed');

            $imagePath = null;
            if ($request->hasFile('image_path')) {
                $imagePath = $request->file('image_path')->store('company_images', 'public');
            }

            // Create Company
            $company = Company::create([
                'name' => $validatedData['company_name'],
                'company_code' => $validatedData['company_code'],
                'password' => Hash::make($validatedData['password']),
                'additional_information' => $validatedData['additional_information'] ?? null,
                'image_path' => $imagePath,
                'status' => 'inactive',
            ]);

            Log::info('Company created successfully', ['company' => $company]);

            // Create Default Company Settings
            CompanySetting::create([
                'company_id' => $company->id,
                'overtime_rate' => 1.5,
                'overtime_enabled' => true,
                'work_hours' => 8,
                'style' => 'default',
                'hourly_rate' => 20.00,
            ]);

            // Create Default Roles
            Role::create(['company_id' => $company->id, 'name' => 'Admin']);
            Role::create(['company_id' => $company->id, 'name' => 'Employee']);
            Role::create(['company_id' => $company->id, 'name' => 'Manager']);

            // Create Default Leave Types
            LeaveType::create(['company_id' => $company->id, 'name' => 'sick_days', 'description' => 'Leave for medical reasons', 'status' => 'active']);
            LeaveType::create(['company_id' => $company->id, 'name' => 'annual_vacations_days', 'description' => 'Leave for vacations', 'status' => 'active']);
            LeaveType::create(['company_id' => $company->id, 'name' => 'holidays', 'description' => 'Leave for personal reasons', 'status' => 'active']);

            return response()->json([
                'status' => 'success',
                'message' => 'Company registered successfully!',
                'company' => $company,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Company Registration Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    }


