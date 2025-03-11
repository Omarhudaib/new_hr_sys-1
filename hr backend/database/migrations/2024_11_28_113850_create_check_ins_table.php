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
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('check_in');
            $table->string('location_in')->nullable(); // Adding location_in column
            $table->decimal('latitude_in', 10, 6)->nullable(); // Latitude for check-in location
            $table->decimal('longitude_in', 10, 6)->nullable(); // Longitude for check-in location
            $table->string('location_out')->nullable(); // Adding location_out column
            $table->decimal('latitude_out', 10, 6)->nullable(); // Latitude for check-out location
            $table->decimal('longitude_out', 10, 6)->nullable(); // Longitude for check-out location
            $table->timestamp('check_out')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
