<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;
class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SuperAdmin::create([
            'name' => 'Omar Hudaib',
            'email' => 'omarhudaib.it@gmail.com',
            'password' => Hash::make('omar2000@#$'),
        ]);
    }
}
