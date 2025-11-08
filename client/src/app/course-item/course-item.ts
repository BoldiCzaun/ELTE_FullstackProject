import { Component, inject, input, Input } from '@angular/core';
import { Course } from '../course-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-item',
  imports: [],
  templateUrl: './course-item.html',
  styleUrl: './course-item.css'
})
export class CourseItem {
  protected router = inject(Router);
  public course = input<Course>();
}
