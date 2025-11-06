<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Seeder;

class CourseUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::where('role', 'Student')->first();

        // todo: duplicate mindenhol
        $users = User::whereHas('role', function (Builder $query) use(&$role) {
            $query->where('role_id', $role['id']);
        })->get();

        $courses = Course::all();

        foreach($courses as $course) {
            $selected = fake()->randomElements($users, fake()->numberBetween($course->max_student / 2, $course->max_student));
            foreach($selected as $student) {
                $student->student_courses()->attach($course->id);
            }
        }
    }
}
