<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearAndSeedDatabase extends Command
{
    // اسم الأمر عند التنفيذ
    protected $signature = 'db:clear-and-seed';

    // الوصف الخاص بالأمر
    protected $description = 'Clear all data from the database and run the seeder to insert fresh data';

    // تنفيذ الأمر
    public function handle()
    {
        $this->info('Clearing data from the database...');

        // تعطيل قيود المفتاح الأجنبي مؤقتاً
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // الحصول على جميع أسماء الجداول في قاعدة البيانات
        $tables = DB::select('SHOW TABLES');
        foreach ($tables as $table) {
            $tableName = $table->{"Tables_in_" . env('DB_DATABASE')};  // استخدم اسم قاعدة البيانات
            DB::table($tableName)->truncate();  // مسح بيانات الجدول
            $this->info("Table {$tableName} has been truncated.");
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;'); // إعادة تفعيل قيود المفتاح الأجنبي

        $this->info('Data cleared successfully.');

        $this->info('Running the seeder...');

        // تشغيل Seeder
        $this->call('db:seed');

        $this->info('Seeder completed successfully.');
    }
}
