import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { User } from './user-service';

export type Course = {
  id: number,
  name: string,
  max_student: number,
  description: string | null,
  user_id: number,
  students_count: number
};

export type Requirement = {
  id: number,
  name: string,
  course_id: number,
  begin: string,
  repeat_count: number | null,
  repeat_skip: number | null,
  total_score_weight: number
}

export type Score = {
  id: number,
  score: number,
  user_id: number,
  requirement_id: number,
  requirement_num: number | null,
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
}
