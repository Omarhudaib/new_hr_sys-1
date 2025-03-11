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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id(); // Primary key for leave request
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('user_id')->constrained('users'); // Foreign key to users table
            $table->foreignId('leave_type_id')->constrained('leave_types');
            $table->date('start_date'); // Start date of the leave request
            $table->date('end_date'); // End date of the leave request
            $table->string('image_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // Status of the request
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
