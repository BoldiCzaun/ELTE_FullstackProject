<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Requirement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();
        
        foreach($courses as $course) {
            $count = fake()->numberBetween(1, 10);

            Requirement::factory()
                ->count($count)
                ->create([
                    'course_id' => $course->id,
                    'total_score_weight' => 1.0 / (float)$count 
                ]);
        }
    }
}
