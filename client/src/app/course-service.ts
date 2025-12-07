import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { User } from './user-service';

export type CourseData = {
  name: string,
  description: string | null,
  max_student: number,
}

export type Course = CourseData & {
  id: number,
  user_id: number,
  students_count: number
};

export type RequirementData = {
  name: string,
  begin: string,
  total_score_weight: number
  repeat_count: number | null,
  repeat_skip: number | null
}

export type Requirement = RequirementData & {
  id: number,
  course_id: number,
}

export type ScoreData = {
  score: number,
  user_id: number,
  requirement_num: number | null,
}

export type Score = ScoreData & {
  id: number,
  requirement_id: number,
  user_name: string | null
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);

  store(course: Course) {
    let formData = new FormData();

    formData.append("name", course.name);
    formData.append("max_student", course.max_student.toString());

    if(course.description) {
      formData.append("description", course.description);
    }

    formData.append("user_id", course.user_id.toString());

    return this.http.post("/api/courses", formData).pipe(
      map(_ => true),
      catchError(err => {
        console.log("user creation failed", err);
        return of(false);
      })
    );
  }

  update(course_id: string, course_data: CourseData) {
    let formData = new FormData();

    formData.append("name", course_data.name);
    if(course_data.description) formData.append("description", course_data.description);
    formData.append("max_student", course_data.max_student.toString());
    formData.append("_method", "PATCH");

    const url = "/api/courses/" + course_id;
    return this.http.post<Course>(url, formData).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.log(url + " failed", err);
        return of(null);
      })
    );
  }

  updateRequirements(course_id: string, req_id: string, requirementData: RequirementData) {
    let formData = new FormData();

    formData.append("name", requirementData.name);
    formData.append("begin", requirementData.begin);
    formData.append("total_score_weight", requirementData.total_score_weight.toString());
    formData.append("_method", "PATCH");

    let url = "/api/courses/" + course_id + "/requirements/" + req_id;

    return this.http.post<Requirement>(url, formData).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.log(url + " failed", err);
        return of(null);
      })
    );
  }

  deleteRequirements(course_id: string, req_id: string) {
    let url = "/api/courses/" + course_id + "/requirements/" + req_id;

    return this.http.delete(url).pipe(
      map(_ => true),
      catchError(err => {
        console.log(url + " failed", err);
        return of(false);
      })
    );
  }

  updateScore(course_id: string, req_id: string, score_id: string, score: number) {
    let formData = new FormData();

    formData.append("score", score.toString());
    formData.append("_method", "PATCH");

    let url = "/api/courses/" + course_id + "/requirements/" + req_id + "/scores/" + score_id;

    return this.http.post(url, formData).pipe(
      map(_ => true),
      catchError(err => {
        console.log("updateScore failed", err);
        return of(false);
      })
    );
  }

  storeRequirement(course_id: string, requirementData: RequirementData) {
    let formData = new FormData();

    formData.append("name", requirementData.name);
    formData.append("begin", requirementData.begin);
    if(requirementData.repeat_count != null)
      formData.append("repeat_count", requirementData.repeat_count.toString());
    if(requirementData.repeat_skip != null)
      formData.append("repeat_skip", requirementData.repeat_skip.toString());
    formData.append("total_score_weight", requirementData.total_score_weight.toString());

    let url = "/api/courses/" + course_id + "/requirements";

    return this.http.post(url, formData).pipe(
      map(_ => true),
      catchError(err => {
        console.log("storeRequirement failed", err);
        return of(false);
      })
    );
  }

  storeScore(course_id: string, req_id: string, score: ScoreData) {
    let formData = new FormData();

    formData.append("score", score.score.toString());
    formData.append("user_id", score.user_id.toString());

    if(score.requirement_num != null) {
      formData.append("requirement_num", score.requirement_num.toString());
    }

    let url = "/api/courses/" + course_id + "/requirements/" + req_id + "/scores";

    return this.http.post(url, formData).pipe(
      map(_ => true),
      catchError(err => {
        console.log("storeScore failed", err);
        return of(false);
      })
    );
  }

  getCourse(id: string) {
    let url = "/api/courses/" + id;
    return this.http.get<Course>(url).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.log("getCourse failed", err);
        return of(null);
      })
    );
  }

  getAllCourses() {
    let url = "/api/courses";
    return this.http.get<Course[]>(url)
  }

  getCourseScores(id: string, req_id: string) {
    let url = "/api/courses/" + id + "/requirements/" + req_id + "/scores";
    return this.http.get<Score[]>(url).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.log("getCourseScores failed", err);
        return of(null);
      })
    );
  }

  getUserCourses() {
    let url = "/api/user/courses";
    return this.http.get<Course[]>(url).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.log("/api/user/courses failed", err);
        return of(null);
      })
    );
  }

  getRequirements(id: string) {
    let url = "/api/courses/" + id + "/requirements";

    return this.http.get<Requirement[]>(url).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.error("getRequirements failed", err);
        return of(null);
      })
    );
  }

  getStudents(id: string) {
    let url = "/api/courses/" + id + "/students";

    return this.http.get<User[]>(url).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.error("getStudents failed", err);
        return of(null);
      })
    );
  }

  takeCourse(id: string) {
    let url = "/api/user/courses/" + id;

    return this.http.post<Course>(url, null).pipe(
      tap(resp => {
        return of(resp);
      }),
      catchError(err => {
        console.error("getRequirements failed", err);
        return of(null);
      })
    );
  }
}
