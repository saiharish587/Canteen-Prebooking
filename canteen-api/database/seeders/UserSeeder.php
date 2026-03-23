<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@bvrit.ac.in'],
            [
                'username' => 'admin',
                'email' => 'admin@bvrit.ac.in',
                'password' => Hash::make('Admin@123'),
                'user_type' => 'admin',
            ]
        );

        // Create sample student user
        User::firstOrCreate(
            ['email' => '21bd001@bvrit.ac.in'],
            [
                'username' => 'rajesh_kumar',
                'email' => '21bd001@bvrit.ac.in',
                'password' => Hash::make('password123'),
                'user_type' => 'student',
            ]
        );

        // Create sample faculty user
        User::firstOrCreate(
            ['email' => 'faculty@bvrit.ac.in'],
            [
                'username' => 'prof_sharma',
                'email' => 'faculty@bvrit.ac.in',
                'password' => Hash::make('faculty@123'),
                'user_type' => 'faculty',
            ]
        );
    }
}
