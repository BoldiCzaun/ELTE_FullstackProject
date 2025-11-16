import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Course, CourseService} from '../course-service';
import {Router} from '@angular/router';
import {AuthService} from '../auth-service';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-item',
  imports: [],
  templateUrl: './course-item.html',
  styleUrl: './course-item.css'
})
export class CourseItem {
  protected router = inject(Router);
  protected authService = inject(AuthService);
  protected courseService = inject(CourseService);
  protected role = toSignal(this.authService.role);

  @Input() isUserCourse!: boolean;
  @Input() course!: Course;
  @Output() taken = new EventEmitter<Course>();

  canBePicked(): boolean {
    let course = this.course as Course
    let maxStudent= course.max_student as number;
    let studentCount = course.students_count as number;


    return maxStudent > studentCount && !this.isUserCourse;
  }

  takeCourse() {
    let course = this.course as Course;
    this.courseService.takeCourse(course.id.toString()).subscribe(success => {
      if(success) {
        console.log("successfully taken subject x");
      }
    });
    this.taken.emit(course);
    console.log("taking course")
  }
}
