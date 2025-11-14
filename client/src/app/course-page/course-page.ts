import { Component, inject, signal } from '@angular/core';
import { Course, CourseData, CourseService, Requirement } from '../course-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-page',
  imports: [FormsModule],
  templateUrl: './course-page.html',
  styleUrl: './course-page.css'
})
export class CoursePage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected editName: string = '';
  protected editDescription: string = '';
  protected isEditing = signal(false);

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

  protected startEdit() {
    this.isEditing.set(true);

    let course = this.course();
    if(course == null) return;

    this.editName = course.name;

    if(course.description) this.editDescription = course.description;
    else this.editDescription = '';
  }

  protected saveEdit() {
    this.isEditing.set(false);

    let course = this.course();
    if(course == null) return;

    let courseData: CourseData = {
      name: this.editName,
      description: (this.editDescription == '') ? null : this.editDescription,
      max_student: course.max_student
    };

    this.courseService.update(course.id.toString(), courseData).subscribe(v => {
      if(!v) return;
      
      this.course.set(v);
    });
  }

  protected openScores(id: number, req_id: number) {
    this.router.navigate(["course", id, req_id, "scores"], {
      state: this.requirements()?.find(e => e.id == req_id)
    });
  }
}
