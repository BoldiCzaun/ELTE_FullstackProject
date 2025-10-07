<?php

namespace App\Http\Controllers;

use App\Enums\Role as EnumsRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function checkAuth() {
        if(!Auth::hasUser()) {
            abort(403);
        }

        return response();
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

        $creds = $request->only('email', 'password');
        
        if (!Auth::attempt($creds)) {
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

        // todo: egyelőre hardcodeolt hogy teacher, mivel az admin azokat csinálja
        // idk a userek hogy lesznek..?
        $role = Role::all()->where('role', '=', EnumsRole::Teacher)->first();
        $role->users()->attach($user->id);

        return response()->json([
            'message' => 'Sikeres regisztráció!',
            'user' => $user
        ]);
    }
}
