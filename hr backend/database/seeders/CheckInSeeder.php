<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Company;

class CheckInSeeder extends Seeder
{
    public function run()
    {
        // Define department locations
        $locations = [
            'IT' => ['latitude' => 34.0522, 'longitude' => -118.2437],  // IT department's location
            'HR' => ['latitude' => 34.0522, 'longitude' => -118.2437],  // HR department's location
        ];

        // Define users (ID and department) starting from user_id 6 to 15
        $users = [];
        for ($id = 1; $id <= 20; $id++) {  // Start from user_id 6 and go up to 15
            $users[] = [
                'id' => $id,
                'department' => rand(0, 1) ? 'IT' : 'HR',  // Randomly assign HR or IT
                'role' => rand(0, 1) ? 'Admin' : 'Employee',
            ];
        }

        // Set a smaller date range: for example, the last 6 months
        $startDate = Carbon::now()->subMonths(10);
        $endDate = Carbon::now();

        // Loop through all companies
        $companies = Company::all();

        foreach ($companies as $company) {
            // Generate check-in records for each user in the company
            foreach ($users as $user) {
                for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                    if ($date->isWeekend()) continue;  // Skip weekends

                    $checkInTime = $date->copy()->setTime(rand(8, 10), rand(0, 59));
                    $checkOutTime = $date->copy()->setTime(rand(17, 19), rand(0, 59));

                    // Admins get randomized locations
                    $location = $user['role'] === 'Admin'
                        ? [
                            'latitude' => rand(340000000, 349999999) / 10000000,
                            'longitude' => rand(-1189999999, -1180000000) / 10000000,
                        ]
                        : $locations[$user['department']];

                    // Insert check-in data for each company
                    DB::table('check_ins')->insert([
                        'company_id'    => $company->id, // Using current company's ID
                        'user_id'       => $user['id'],
                        'check_in'      => $checkInTime,
                        'location_in'   => 'Building ' . ($user['department'] === 'IT' ? 1 : 2),
                        'latitude_in'   => $location['latitude'],
                        'longitude_in'  => $location['longitude'],
                        'check_out'     => $checkOutTime,
                        'location_out'  => 'Building ' . ($user['department'] === 'IT' ? 1 : 2),
                        'latitude_out'  => $location['latitude'],
                        'longitude_out' => $location['longitude'],
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }
            }
        }
    }
}
