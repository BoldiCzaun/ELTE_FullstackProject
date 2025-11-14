<?php

use App\Enums\Role as EnumsRole;
use App\Http\Controllers\CourseController;
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

Route::get('/courses', [CourseController::class, 'getAll'])->middleware('auth:sanctum');
Route::get('/courses/{id}', [CourseController::class, 'get'])->middleware('auth:sanctum');
Route::post('/courses', [CourseController::class, 'store'])->middleware('auth:sanctum');
Route::patch('/courses/{id}', [CourseController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->middleware('auth:sanctum');

Route::get('/courses/{id}/students', [CourseController::class, 'getStudents'])->middleware('auth:sanctum');

Route::get('/courses/{id}/requirements', [CourseController::class, 'getRequirements'])->middleware('auth:sanctum');
Route::post('/courses/{id}/requirements', [CourseController::class, 'storeRequirements'])->middleware('auth:sanctum');

Route::get('/courses/{id}/requirements/{req_id}/scores', [CourseController::class, 'getScores'])->middleware('auth:sanctum');
Route::post('/courses/{id}/requirements/{req_id}/scores', [CourseController::class, 'storeScores'])->middleware('auth:sanctum');

Route::patch('/courses/{id}/requirements/{req_id}/scores/{score_id}', [CourseController::class, 'updateScores'])->middleware('auth:sanctum');

Route::post('/user/courses/{id}', [UserController::class, 'takeCourse'])->middleware('auth:sanctum');
Route::get('/user/courses', [UserController::class, 'getCourses'])->middleware('auth:sanctum');

Route::get('/user/scores', [UserController::class, 'getScores'])->middleware('auth:sanctum');

Route::post('/user', [UserController::class, 'store']);
Route::delete('/user', [UserController::class, 'destroy'])->middleware('auth:sanctum');

Route::get('/checkAuth', [UserController::class, 'checkAuth']);
Route::post('/login', [UserController::class, 'login']);
