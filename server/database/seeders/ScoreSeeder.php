<?php

namespace Database\Seeders;

use App\Models\Requirement;
use App\Models\Role;
use App\Models\Score;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Seeder;

class ScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::where('role', 'Student')->first();

        $students = User::whereHas('role', function (Builder $query) use(&$role) {
            $query->where('role_id', $role['id']);
        })->get();

        foreach($students as $student) {
            $courses = $student->student_courses()->get();
            foreach($courses as $course) {
                $requirements = $course->requirements()->get();
                foreach($requirements as $requirement) {
                    if(fake()->boolean(50)) {
                        continue;
                    }

                    $repeat_count = $requirement->repeat_count;

                    Score::factory()
                        ->count(1)
                        ->create([
                            'user_id' => $student->id,
                            'requirement_id' => $requirement->id,
                            'requirement_num' => $repeat_count != null ? fake()->numberBetween(0, $repeat_count - 1) : null
                        ]);
                }
            }
        }
    }
}
