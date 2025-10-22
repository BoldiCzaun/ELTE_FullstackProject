<?php

use App\Enums\Role as EnumsRole;
use App\Http\Controllers\UserController;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/roles', function (Request $request) {
    if(!$request->user()->isAdmin()) abort(403);

    return Role::all();
})->middleware('auth:sanctum');

Route::get('/role', function (Request $request, string $id) {
    if(!$request->user()->isAdmin()) abort(403);

    if(!$request->has('user_id')) {
        abort(400);
    }

    $user = User::findOrFail($request->get('user_id'));
    return response()->json([
        'role' => $user->role['role']
    ]);
})->middleware('auth:sanctum')->where('id', '[0-9]+');

Route::get('/users', function (Request $request) {
    if(!$request->user()->isAdmin()) abort(403);

    if($request->has('role')) {
        $role = Role::where('role', $request->get('role'))->first();
        return User::whereHas('role', function (Builder $query) use(&$role) {
            $query->where('role_id', $role->id);
        })->get();
    }

    return User::all();
})->middleware('auth:sanctum');

Route::get('/user/isAdmin', function (Request $request) {
    if(!$request->user()->isAdmin()) {
        abort(403);
    }

    return response()->noContent();
})->middleware('auth:sanctum');

Route::post('/user', [UserController::class, 'store'])->middleware('auth:sanctum');
Route::delete('/user', [UserController::class, 'destroy'])->middleware('auth:sanctum');

Route::get('/checkAuth', [UserController::class, 'checkAuth']);
Route::post('/login', [UserController::class, 'login']);