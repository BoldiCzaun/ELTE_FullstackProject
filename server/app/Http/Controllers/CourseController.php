<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function get(string $id) {
        $course = Course::withCount('students')->findOrFail($id);

        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        if(Auth::user()->role->student()) {
            if(Auth::user()->student_courses()->where('course_id', $id)->get()->isEmpty()) {
                return abort(401, 'Nem vetted fel ezt a tárgyat!');
            }
        }
        else if(!Auth::user()->role->teacher()) {
            return abort(401, 'Nem vagy tanár!');
        }
        else if(Auth::user()->id != $course->user_id) {
            return abort(401, 'Nem a saját kurzusod!');
        }

        return response()->json($course);
    }

    public function getStudents(string $id) {
        $course = Course::findOrFail($id);

        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        if(!Auth::user()->role->teacher()) {
            return abort(401, 'Nem vagy tanár!');
        }
        else if(Auth::user()->id != $course->user_id) {
            return abort(401, 'Nem a saját kurzusod!');
        }

        return response()->json($course->students()->get());
    }

    public function getRequirements(string $id) {
        $course = Course::findOrFail($id);

        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        if(Auth::user()->role->student()) {
            if(Auth::user()->student_courses()->where('course_id', $id)->get()->isEmpty()) {
                return abort(401, 'Nem vetted fel ezt a tárgyat!');
            }
        }
        else if(!Auth::user()->role->teacher()) {
            return abort(401, 'Nem vagy tanár!');
        }
        else if(Auth::user()->id != $course->user_id) {
            return abort(401, 'Nem a saját kurzusod!');
        }

        return response()->json($course->requirements()->get());
    }

    public function getAll(Request $request) {
        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        return response()->json(Course::withCount('students')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'max_student' => 'required|integer',
            'description' => 'string',
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
            'integer' => 'A :attribute mezőnek egész számnak kell lennie!',
            'exists' => 'A felhasználó nem létezik!'
        ], [
            'name' => 'Név',
            'max_student' => 'Maximum diákok száma',
            'description' => 'Leirás'
        ]);

        if(!Auth::hasUser()) {
            return abort(401);
        }

        if(!Auth::user()->role->teacher()) {
            return abort(401);
        }

        $validated['user_id'] = Auth::user()->id;
        $course = Course::create($validated);
        
        return response()->json([
            'message' => 'Sikeres tantárgy kreáció!',
            'course' => $course
        ]);
    }

    public function update(Request $request) {
        $validated = $request->validate([
            'id' => 'required|integer|exists:courses',
            'name' => 'string',
            'max_student' => 'integer',
            'description' => 'string'
        ], [
            'exists' => 'A kurzus nem létezik!',
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
            'integer' => 'A :attribute mezőnek egész számnak kell lennie!',
        ], [
            'id' => 'azonositó',
            'name' => 'név',
            'max_student' => 'maximum diákok száma',
            'description' => 'leirás'
        ]);

        $course = Course::findOrFail($validated['id']);

        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        if(!Auth::user()->role->teacher()) {
            return abort(401, 'Nem vagy tanár!');
        }

        if(Auth::user()->id != $course->user_id) {
            return abort(401, 'Nem a saját kurzusod!');
        }

        $course = $course->update($validated);
        
        return response()->json([
            'message' => 'Sikeres tantárgy módositás!',
            'course' => $course
        ]);
    }

    public function destroy(string $id) {
        $course = Course::findOrFail($id);

        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        if(!Auth::user()->role->teacher()) {
            return abort(401, 'Nem vagy tanár!');
        }

        if(Auth::user()->id != $course->user_id) {
            return abort(401, 'Nem a saját kurzusod!');
        }

        $course->delete();

        return response()->noContent();
    }
}
