<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Requirement>
 */
class RequirementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $doesntHaveRepeat = fake()->boolean(30);

        return [
            'name' => fake()->word(),
            'begin' => fake()->date(),
            'repeat_count' => $doesntHaveRepeat ? null : fake()->numberBetween(1, 9),
            'repeat_skip' => (!$doesntHaveRepeat && fake()->boolean(25)) ? fake()->numberBetween(0,2) : null
        ];
    }
}
