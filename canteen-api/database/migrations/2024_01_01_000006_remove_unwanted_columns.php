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
        Schema::table('users', function (Blueprint $table) {
            // Drop unwanted columns
            $table->dropColumn([
                'name',
                'first_name',
                'last_name',
                'email_verified_at',
                'student_id',
                'phone',
                'is_active',
                'last_login_at'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add back the columns if migration is rolled back
            $table->string('name')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('student_id')->nullable();
            $table->string('phone')->nullable();
            $table->tinyInteger('is_active')->default(1);
            $table->timestamp('last_login_at')->nullable();
        });
    }
};
