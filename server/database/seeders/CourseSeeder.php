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

        // todo: ne legyen ugyanaz a tanáré mindegyik
        // (probléma: útólag nem tudok hozzáadni random usereket mert készitéskor kell)
        Course::factory()
            ->count(20)
            ->create([
                'user_id' => fake()->randomElement($users)['id']
            ]);
    }
}
