<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->enum('style', [
                'default', 'modern', 'classic', 'dark', 'light', 'blue', 'green', 'red', 'yellow', 'purple', 'pink'
            ])->default('default')->change(); // تعديل عمود style
        });
    }
    
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->enum('style', ['default', 'modern', 'classic'])->default('default')->change(); // استرجاع الأنماط القديمة
        });
    }
    

   
};
