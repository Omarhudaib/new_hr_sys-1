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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies'); // Without onDelete cascade
            $table->foreignId('role_id')->constrained('role');
            $table->foreignId('department_id')->constrained('departments'); // Without onDelete cascade// If the department is deleted, users in that department are also deleted.
            $table->string('password');
            $table->string('user_code')->unique();
            $table->string('additional_information')->nullable();
            $table->string('first_name');
            $table->string('second_name');
            $table->string('middle_name');
            $table->string('last_name');
            $table->string('image_path')->nullable();
            $table->string('national_id')->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced'])->nullable();  // For marital status            $table->string('position');
            $table->enum('attendtaby', ['any location', 'dep location'])->default('any location');
            $table->date('date_of_birth');
            $table->integer('holidays');
            $table->decimal('salary', 10, 2);
            $table->integer('sick_days');
            $table->integer('annual_vacations_days');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
