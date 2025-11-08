import { Component, inject, signal } from '@angular/core';
import { Course, CourseService, Requirement } from '../course-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course-page',
  imports: [],
  templateUrl: './course-page.html',
  styleUrl: './course-page.css'
})
export class CoursePage {
  private route = inject(ActivatedRoute);
  protected courseService = inject(CourseService);

  protected requirements = signal<Requirement[] | null>(null);
  protected course = signal<Course | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) {
      console.error("course page: id was null");
      return;
    }

    this.courseService.getCourse(id).subscribe(v => {
      if(!v) return;
      this.course.set(v);
    });

    this.courseService.getRequirements(id).subscribe(v => {
      if(!v) return;
      this.requirements.set(v);
      console.log(v);
    });
  }
}
