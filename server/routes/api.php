<?php

use App\Enums\Role as EnumsRole;
use App\Http\Controllers\UserController;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/user/isAdmin', function (Request $request) {
    $isAdmin = $request->user()->role->id == Role::all()->where('role', '=', EnumsRole::Admin)->first()->id;
    
    if(!$isAdmin) {
        abort(403);
    }

    return response()->noContent();
})->middleware('auth:sanctum');

Route::post('/admin/createUser', [UserController::class, 'store'])
->middleware('auth:sanctum');

Route::get('/checkAuth', [UserController::class, 'checkAuth']);
Route::post('/login', [UserController::class, 'login']);