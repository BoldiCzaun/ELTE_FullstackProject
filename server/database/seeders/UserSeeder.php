<?php

namespace Database\Seeders;

use App\Enums\Role as EnumsRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // tanárok elkészitése
        $users = User::factory()
            ->count(20)
            ->create();
        
        $role = Role::where('role', 'Teacher')->first();

        foreach($users as $user) {
            $role->users()->attach($user->id);            
        }

        // tanulók elkészitése
        $students = User::factory()
            ->count(100)
            ->create();
        
        $role = Role::where('role', 'Student')->first();

        foreach($students as $user) {
            $role->users()->attach($user->id);            
        }
    }
}
