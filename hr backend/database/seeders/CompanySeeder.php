<?php

  namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Department;
use App\Models\CompanySetting;
use App\Models\Role;
use App\Models\User;
use App\Models\LeaveType;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CompanySeeder  extends Seeder
{
    public function run()
    {
        $companies = [
            ['name' => 'Company A', 'company_code' => 'c1', 'password' => 'omar2000', 'image_path' => 'images/company_a.png'],
            ['name' => 'Company B', 'company_code' => 'c2', 'password' => 'omar2000', 'image_path' => 'images/company_b.png'],

        ];

        foreach ($companies as $data) {
            $company = Company::create([
                'name' => $data['name'],
                'company_code' => $data['company_code'],
                'password' => Hash::make($data['password']),
                'image_path' => $data['image_path'],
                'status' => 'inactive',
            ]);

            Log::info('Company created successfully', ['company' => $company]);

            CompanySetting::create([
                'company_id' => $company->id,
                'overtime_rate' => 1.5,
                'overtime_enabled' => true,
                'work_hours' => 8,
                'style' => 'default',
            ]);

            $roles = ['Admin', 'Employee', 'Manager'];
            foreach ($roles as $role) {
                Role::create(['company_id' => $company->id, 'name' => $role]);
            }

            $leaveTypes = [
                ['name' => 'sick_days', 'description' => 'Leave for medical reasons'],
                ['name' => 'annual_vacations_days', 'description' => 'Leave for vacations'],
                ['name' => 'holidays', 'description' => 'Leave for personal reasons'],
            ];

            foreach ($leaveTypes as $leaveType) {
                LeaveType::create([
                    'company_id' => $company->id,
                    'name' => $leaveType['name'],
                    'description' => $leaveType['description'],
                    'status' => 'active',
                ]);
            }

            // إضافة الديبارتمنت قبل إنشاء اليوزرات
            for ($d = 1; $d <= 10; $d++) {
                // محاكاة البيانات التي قد تأتي من الـ $request
                $depName = 'Department ' . $d;
                $locName = 'Location ' . $d;
                $latitude = rand(-90, 90);
                $longitude = rand(-180, 180);

                $department = Department::create([
                    'company_id' => $company->id,
                    'dep_name' => $depName,
                    'loc_name' => $locName,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]);

                $roles = [1, 2];
                foreach ($roles as $roleId) {
                    User::create([
                        'company_id' => $company->id,
                        'role_id' => $roleId,
                        'department_id' => $department->id,
                        'password' => bcrypt('omar2000'),
                        'user_code' => strtoupper(substr($company->name, 0, 3)) . rand(1000, 9999),
                        'first_name' => 'John',
                        'second_name' => 'Doe',
                        'middle_name' => 'A.',
                        'last_name' => 'Smith',
                        'national_id' => rand(100000, 999999),
                        'marital_status' => 'single',
                        'attendtaby' => 'any location',
                        'date_of_birth' => '1990-01-01',
                        'holidays' => 10,
                        'salary' => 400,
                        'sick_days' => 14,
                        'annual_vacations_days' => 14,
                        'work_type' => 'normal',
                    ]);
                }
            }
        }
    }
}
