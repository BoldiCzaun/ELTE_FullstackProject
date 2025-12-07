import {Component, inject, signal} from '@angular/core';
import {CourseItem} from '../course-item/course-item';
import {AuthService} from '../auth-service';
import {Course, CourseService} from '../course-service';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-take-course-page',
  imports: [
    CourseItem
  ],
  templateUrl: './take-course-page.html',
  styleUrl: './take-course-page.css'
})
export class TakeCoursePage {
  protected authService = inject(AuthService);
  protected courseService = inject(CourseService);
  protected role = toSignal(this.authService.role);
  protected courses = signal<Course[]>([]);
  protected userCourses = signal<Course[]>([]);

  constructor() {
    this.courseService.getAllCourses().subscribe(v => {
      if(v) this.courses.set(v as Course[]);
      console.log(v);
    });

    this.courseService.getUserCourses().subscribe(courses => {
      this.userCourses.set((courses ?? []) as Course[]);
    });
  }

  isUserCourse(course: Course): boolean {
    let userCourses = this.userCourses() as Course[]
    return userCourses.some(c => c.id == course.id)
  }

  onCourseTaken(course: Course) {
    console.log("on course taken")

    // updateljük a courses-t is hogy frissüljön a student count amikor felveszed a tárgyat
    this.courses.update(list => list.map(c => c.id === course.id ? course : c));
    
    this.userCourses.update(list => list.some(c => c.id === course.id) ? list : [...list, course]);
  }
}
