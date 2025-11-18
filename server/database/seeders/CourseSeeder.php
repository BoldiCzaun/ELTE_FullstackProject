<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Role;
use App\Models\RoleUser;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::where('role', 'Teacher')->first();

        $users = User::whereHas('role', function (Builder $query) use(&$role) {
            $query->where('role_id', $role['id']);
        })->get();

        $count = fake()->numberBetween(20, 35);
        for($i = 0; $i < $count; $i++) {
            Course::factory()
                ->create([
                    'user_id' => fake()->randomElement($users)['id']
                ]);
        }
        
    }
}
