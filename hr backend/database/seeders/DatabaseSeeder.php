<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\CompanySeeder;
use Database\Seeders\CheckInSeeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // استدعاء Seeders الأخرى
        $this->call([
            CompanySeeder::class,
            CheckInSeeder::class,
        ]);
    }
}
