<?php

namespace Tests\Feature;

use App\Enums\Role as RolesEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;


class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void {
        parent::setUp();
        $this->seed();
    }

    public function testRegister()
    {
        $this->actingAsAdmin();
        $testUserName = 'Test User 1';
        $testEmail = 'test.user1@example.com';
        $payload = [
            'name' => $testUserName,
            'email' => $testEmail,
            'password' => 'password',
            'role' => RolesEnum::Teacher->name,
        ];

        $response = $this->post('/api/admin/createUser', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('users', [
            'name' => $testUserName,
            'email' => $testEmail,
        ]);
        $resUser = User::all()->where('name', $testUserName)->first();
        $this->assertEquals(RolesEnum::Teacher, $resUser->role?->role);
    }

    public function testLogin()
    {
        $testUserName = 'Login Test User 1';
        $testEmail = 'login.testuser1@example.com';
        $testPassword = 'password';
        $user = $this->createAndActAsUser($testUserName, $testEmail, $testPassword);

        $response = $this->post('/api/login', [
            'email' => $testEmail,
            'password' => $testPassword,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user', 'token', 'token_type', 'user_role']);
    }

    protected function actingAsAdmin(): User
    {
        $admin = User::factory()->create([
            'name' => 'test-admin',
            'email' => 'test-admin@test.local',
        ]);

        $adminRole = Role::all()->where('role', RolesEnum::Admin)->first();

        $adminRole->users()->attach($admin->id);

        $this->actingAs($admin); // for web guard tests
        // If you're testing API with Sanctum:
        // $admin->createToken('test', ['*']); // or abilities: ['admin']
        // $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken);
        Sanctum::actingAs($admin, ['admin']);

        return $admin;
    }

    private function createAndActAsUser(string $userName, string $email, string $password): User {
        $this->actingAsAdmin();
        $payload = [
            'name' => $userName,
            'email' => $email,
            'password' => $password,
            'role' => RolesEnum::Teacher->name,
        ];

        $response = $this->post('/api/admin/createUser', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('users', [
            'name' => $userName,
            'email' => $email,
        ]);
        $resUser = User::all()->where('name', $userName)->first();
        $this->assertEquals(RolesEnum::Teacher, $resUser->role?->role);

        $this->actingAs($resUser);
        return $resUser;
    }
}
