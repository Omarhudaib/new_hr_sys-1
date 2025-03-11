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
    Schema::create('companies', function (Blueprint $table) {
        $table->id();
        $table->string('name')->unique(); // Add unique constraint to match validation
        $table->string('company_code')->unique();
        $table->string('password');
        $table->text('additional_information')->nullable(); // Allow null values
        $table->string('image_path')->nullable();
        $table->enum('status', ['active', 'inactive'])->default('inactive');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
