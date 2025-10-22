<?php

namespace App\Http\Controllers;

use App\Enums\Role as EnumsRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private const REGISTRABLE_ROLES = [EnumsRole::Student, EnumsRole::Teacher];

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

        $user = Auth::user();

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
        if(!Auth::hasUser()) {
            return response()->json([
                'message' => 'Nem vagy bejelentkezve!',
            ], 403);
        }

        if(!Auth::user()->role->admin()) {
            return response()->json([
                'message' => 'Nem vagy admin!',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string',
            'role' => 'required|' . Rule::in(array_map(fn($e) => $e->name, self::REGISTRABLE_ROLES)),
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
        ], [
            'name' => 'Név',
            'email' => 'Email',
            'password' => 'Jelszó',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'])
        ]);

        $role = Role::all()->where('role', $validated['role'])->firstOrFail();
        $role->users()->attach($user->id);

        return response()->json([
            'message' => 'Sikeres regisztráció!',
            'user' => $user
        ]);
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
