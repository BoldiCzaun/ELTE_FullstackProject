<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    //
    public function login(Request $request) {
        $validated = $request->validate([
            'email' => 'required|string',
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
}
