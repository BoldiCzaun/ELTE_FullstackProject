import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth-service';
import { Course, CourseService } from '../course-service';
import { CourseItem } from '../course-item/course-item';

@Component({
  selector: 'app-course-list',
  imports: [CourseItem],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList {
  protected authService = inject(AuthService);
  protected courseService = inject(CourseService);
  protected role = toSignal(this.authService.role);
  protected courses = signal<Course[]>([]);

  constructor() {
    this.courseService.getUserCourses().subscribe(v => {
      if(v) this.courses.set(v);
      console.log(v);
    });
  }
}
