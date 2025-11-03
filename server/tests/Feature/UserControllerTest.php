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

    public function testRegisterStudent()
    {
        $testUserName = 'Test Student';
        $testEmail = 'test.student@example.com';
        $payload = [
            'name' => $testUserName,
            'email' => $testEmail,
            'password' => 'password',
        ];

        $response = $this->post('/api/user', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('users', [
            'name' => $testUserName,
            'email' => $testEmail,
        ]);
        $resUser = User::all()->where('name', $testUserName)->first();
        $this->assertEquals(RolesEnum::Student, $resUser->role?->role);
    }

    public function testRegisterTeacher()
    {
        $this->actingAsAdmin();
        $testUserName = 'Test Teacher';
        $testEmail = 'test.teacher@example.com';
        $payload = [
            'name' => $testUserName,
            'email' => $testEmail,
            'password' => 'password',
        ];

        $response = $this->post('/api/user', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('users', [
            'name' => $testUserName,
            'email' => $testEmail,
        ]);
        $resUser = User::all()->where('name', $testUserName)->first();
        $this->assertEquals(RolesEnum::Teacher, $resUser->role?->role);
    }

    public function testLoginAsTeacher()
    {
        $testUserName = 'Login Teacher';
        $testEmail = 'login.teacher@example.com';
        $testPassword = 'password';
        $this->createTeacher($testUserName, $testEmail, $testPassword);

        $response = $this->post('/api/login', [
            'email' => $testEmail,
            'password' => $testPassword,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user', 'token', 'token_type', 'user_role']);
        $this->assertEquals($testUserName, $response->json('user.name'));
        $this->assertEquals($testEmail, $response->json('user.email'));
        $this->assertEquals(RolesEnum::Teacher->name, $response->json('user.role.role'));
    }

    public function testLoginAsStudent()
    {
        $testUserName = 'Login Student';
        $testEmail = 'login.student@example.com';
        $testPassword = 'password';
        $this->createStudent($testUserName, $testEmail, $testPassword);

        $response = $this->post('/api/login', [
            'email' => $testEmail,
            'password' => $testPassword,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user', 'token', 'token_type', 'user_role']);
        $this->assertEquals($testUserName, $response->json('user.name'));
        $this->assertEquals($testEmail, $response->json('user.email'));
        $this->assertEquals(RolesEnum::Student->name, $response->json('user.role.role'));
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

    private function createTeacher(string $userName, string $email, string $password): User {
        $this->actingAsAdmin();
        $payload = [
            'name' => $userName,
            'email' => $email,
            'password' => $password,
            'role' => RolesEnum::Teacher->name,
        ];

        $response = $this->post('/api/user', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('users', [
            'name' => $userName,
            'email' => $email,
        ]);
        $resUser = User::all()->where('name', $userName)->first();
        $this->assertEquals(RolesEnum::Teacher, $resUser->role?->role);

//        $this->actingAs($resUser);
        return $resUser;
    }

    private function createStudent(string $userName, string $email, string $password): User
    {
        $payload = [
            'name' => $userName,
            'email' => $email,
            'password' => $password,
            'role' => RolesEnum::Student->name,
        ];

        $response = $this->post('/api/user', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'user']);
        $this->assertDatabaseHas('users', [
            'name' => $userName,
            'email' => $email,
        ]);
        $resUser = User::all()->where('name', $userName)->first();
        $this->assertEquals(RolesEnum::Student, $resUser->role?->role);

        $this->actingAs($resUser);
        return $resUser;
    }
}
