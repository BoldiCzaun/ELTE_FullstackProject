<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/admin/createUser', [UserController::class, 'store'])
->middleware('auth:sanctum');

Route::get('/checkAuth', [UserController::class, 'checkAuth']);
Route::post('/login', [UserController::class, 'login']);