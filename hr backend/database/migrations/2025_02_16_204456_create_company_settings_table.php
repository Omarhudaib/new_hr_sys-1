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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->integer('work_hours')->default(8);
            $table->decimal('overtime_rate', 5, 2)->default(1.5);
            $table->boolean('overtime_enabled')->default(true); // حقل لتفعيل الدوام الإضافي
            $table->enum('style', [
                'default', 'modern', 'classic', 'dark', 'light', 'blue', 'green', 'red', 'yellow', 'purple', 'pink'
            ])->default('default'); // حقل الستايل مع إضافة 10 أنماط جديدة
            $table->timestamps();
        });
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
