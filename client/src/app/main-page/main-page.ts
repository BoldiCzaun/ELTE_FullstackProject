import {Component, inject, signal} from '@angular/core';
import { CourseList } from "../course-list/course-list";
import {AuthService} from '../auth-service';
import {Course, CourseService} from '../course-service';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-page',
  imports: [CourseList],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css'
})
export class MainPage {
  protected authService = inject(AuthService);
  protected courseService = inject(CourseService);
  protected role = toSignal(this.authService.role);
  protected courses = signal<Course[]>([]);

  constructor() {
    this.courseService.getAllCourses().subscribe(v => {
      if(v) this.courses.set(v as Course[]);
      console.log(v);
    });
  }
}
