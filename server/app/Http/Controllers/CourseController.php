<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Requirement;
use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function get(string $id) {
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

        return response()->json($course->requirements()->orderBy('created_at', 'DESC')->get());
    }

    public function getScores(string $id, string $req_id) {
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

        return response()->json($course
            ->requirements()
            ->findOrFail($req_id)
            ->scores()
            ->orderBy('user_id')
            ->orderBy('requirement_num')
            ->get()
        );
    }

    public function storeScores(Request $request, string $id, string $req_id) {
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

        $requirement = $course->requirements()->findOrFail($req_id);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'user_id' => 'required|exists:users,id',
            'requirement_num' => 'integer|min:0',
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
            'integer' => 'A :attribute mezőnek egész számnak kell lennie!',
            'exists' => 'A felhasználó nem létezik!'
        ], [
            'score' => 'Pontszám',
            'user_id' => 'Felhasználó azonositó',
            'requirement_num' => 'Követelmény sorszáma'
        ]);

        if($requirement->repeat_count != null && $validated['requirement_num'] >= $requirement->repeat_count) {
            abort(403, 'requirement_num meghaladja repeat_count-ot!');
        }

        $validated['requirement_id'] = $req_id;

        $check_unique = $requirement->scores()->where([
            'user_id' => $validated['user_id'],
            'requirement_num' => $validated['requirement_num'],
            'requirement_id' => $validated['requirement_id'],
        ])->count();

        if($check_unique > 0) {
            return abort(403, 'Már van ilyen követelmény!');
        }

        $score = Score::create($validated);

        return response()->json([
            'message' => 'Sikeres pontozás kreáció!',
            'score' => $score
        ]);
    }

    public function updateScores(Request $request, string $id, string $req_id, string $score_id) {
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

        $requirement = $course->requirements()->findOrFail($req_id);
        $score = $requirement->scores()->findOrFail($score_id);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100'
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'integer' => 'A :attribute mezőnek egész számnak kell lennie!',
        ], [
            'score' => 'Pontszám'
        ]);

        $score['score'] = $validated['score'];
        $score->save();

        return response()->json([
            'message' => 'Sikeres pontozás frissités!',
            'score' => $score
        ]);
    }

    public function getAll(Request $request) {
        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        return response()->json(Course::all());
    }

    public function updateRequirements(Request $request, string $id, string $req_id) {
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

        $requirement = $course->requirements()->findOrFail($req_id);

        $validated = $request->validate([
            'name' => 'string',
            'begin' => 'date',
            'total_score_weight' => 'numeric|min:0|max:1'
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
            'integer' => 'A :attribute mezőnek egész számnak kell lennie!',
            'exists' => 'A felhasználó nem létezik!'
        ], []);

        $requirement->update($validated);

        return response()->json($requirement);
    }

    public function storeRequirements(Request $request, string $id) {
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

        $validated = $request->validate([
            'name' => 'required|string',
            'begin' => 'required|date',
            'repeat_count' => 'integer',
            'repeat_skip' => 'integer',
            'total_score_weight' => 'required|numeric|min:0|max:1'
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

        if(key_exists('repeat_skip', $validated) && !key_exists('repeat_count', $validated)) {
            return abort(403, 'repeat_skip csak akkor valid ha repeat_count is bevan állitva!');
        }

        $req = array_merge($validated, [
            'course_id' => $course->id
        ]);

        $requirement = Requirement::create($req);
        
        return response()->json([
            'message' => 'Sikeres követelmény kreáció!',
            'requirement' => $requirement
        ]);
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

    public function update(Request $request, string $id) {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'max_student' => 'integer',
            'description' => 'string'
        ], [
            'required' => 'A :attribute mező kitöltése kötelező!',
            'string' => 'A :attribute mezőnek szövegesnek kell lennie!',
            'integer' => 'A :attribute mezőnek egész számnak kell lennie!',
        ], [
            'name' => 'név',
            'max_student' => 'maximum diákok száma',
            'description' => 'leirás'
        ]);

        if(!Auth::hasUser()) {
            return abort(401, 'Nem vagy bejelentkezve!');
        }

        if(!Auth::user()->role->teacher()) {
            return abort(401, 'Nem vagy tanár!');
        }

        if(Auth::user()->id != $course->user_id) {
            return abort(401, 'Nem a saját kurzusod!');
        }

        $course->update($validated);
        
        return response()->json($course);
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
