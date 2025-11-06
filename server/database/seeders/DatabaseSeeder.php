<?php

namespace Database\Seeders;

use App\Enums\Role as EnumsRole;
use App\Models\Role;
use App\Models\User;
use App\Models\RoleUser;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        Role::factory()->create([
            'role' => EnumsRole::Student
        ]);

        Role::factory()->create([
            'role' => EnumsRole::Teacher
        ]);

        $admin_role = Role::factory()->create([
            'role' => EnumsRole::Admin
        ]);

        $admin = User::factory()->create([
            'name' => 'admin',
            'email' => 'test@example.com',
        ]);

        $admin_role->users()->attach($admin->id);

        $this->call([
            UserSeeder::class,
            CourseSeeder::class,
            CourseUserSeeder::class,
            RequirementSeeder::class,
            ScoreSeeder::class
        ]);
    }
}
