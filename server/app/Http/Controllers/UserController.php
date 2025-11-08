<?php

namespace App\Http\Controllers;

use App\Enums\Role as EnumsRole;
use App\Models\Course;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private const REGISTRABLE_ROLES = [EnumsRole::Student, EnumsRole::Teacher];

    public function takeCourse(string $id) {
        if(!Auth::hasUser()) {
            abort(401, 'Nem vagy bejelentkezve!');
        }

        if(!Auth::user()->role->student()) {
            abort(401, 'Nem vagy diák!');
        }

        $course = Course::findOrFail($id);

        if($course->students()->count() >= $course->max_student) {
            abort(403, 'Már elérte a tárgy a maximum diák számot!');
        }

        if(!Auth::user()->student_courses()
            ->where('course_id', $id)
            ->get()
            ->isEmpty()
        ) {
            abort(403, 'Már felvetted a tárgyat!');
        }

        Auth::user()->student_courses()->attach($id);

        return response()->noContent();
    }

    public function getCourses() {
        if(!Auth::hasUser()) {
            abort(403, 'Nem vagy bejelentkezve!');
        }

        if(Auth::user()->role->teacher()) {
            return response()->json(Auth::user()
                ->teacher_courses()
                ->withCount('students')
                ->get()
            );
        }
        if(!Auth::user()->role->student()) {
            abort(403, 'Nem vagy diák!');
        }
        
        return response()->json(Auth::user()
            ->student_courses()
            ->withCount('students')
            ->get()
        );
    }

    public function getScores() {
        if(!Auth::hasUser()) {
            abort(403, 'Nem vagy bejelentkezve!');
        }

        if(!Auth::user()->role->student()) {
            abort(403, 'Nem vagy diák!');
        }
        
        return response()->json(Auth::user()->scores()->get());
    }

    public function checkAuth() {
        if(!Auth::hasUser()) {
            abort(403);
        }

        return response()->noContent();
    }

    //
    public function login(Request $request) {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
        ], [
            'email' => 'Email',
            'password' => 'Jelszó',
        ]);

        if (!Auth::guard('web')->attempt($validated)) {
            return response()->json([
                'message' => 'Hibás email vagy jelszó!',
            ], 401);
        }

        $user = User::all()->where('email', $validated['email'])->first();

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Sikeres bejelentkezés!',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'user_role' => $user->role?->role->name,
        ]);
    }

    public function logout(Request $request) {
        // stateful app miatt
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string',
//            'role' => 'required|' . Rule::in(array_map(fn($e) => $e->name, self::REGISTRABLE_ROLES)),
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
        ], [
            'name' => 'Név',
            'email' => 'Email',
            'password' => 'Jelszó',
        ]);


        if(!Auth::hasUser()) {
            $user = $this->registerStudent($validated);

            return response()->json([
                'message' => 'Sikeres regisztráció!',
                'user' => $user
            ]);
        }
        if(!Auth::user()->role->admin()) {
            return response()->json([
                'message' => 'Nem vagy admin!',
            ], 403);
        }
        $user = $this->registerTeacher($validated);

        return response()->json([
            'message' => 'Sikeres regisztráció!',
            'user' => $user
        ]);
    }

    protected function registerTeacher($data)
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'])
        ]);
        $role = Role::all()->where('role', '=', EnumsRole::Teacher)->first();
        $role->users()->attach($user->id);
        return $user;
    }

    protected function registerStudent($data)
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'])
        ]);
        $role = Role::all()->where('role', '=', EnumsRole::Student)->first();
        $role->users()->attach($user->id);
        return $user;
    }

    public function destroy(Request $request) {
        $user = User::findOrFail($request->get('id'));
        if(!Auth::user()->role->admin()) {
            abort(401);
        }

        $user->delete();
        return response()->noContent();
    }
}
