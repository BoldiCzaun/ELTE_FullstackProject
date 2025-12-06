import { Component, inject, signal } from '@angular/core';
import { Course, CourseData, CourseService, Requirement, RequirementData } from '../course-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RequirementItem } from '../requirement-item/requirement-item';
import { CreateRequirement } from '../create-requirement/create-requirement';
import {AuthService} from '../auth-service';

@Component({
  selector: 'app-course-page',
  imports: [ReactiveFormsModule, FormsModule, RequirementItem, CreateRequirement],
  templateUrl: './course-page.html',
  styleUrl: './course-page.css'
})
export class CoursePage {
  private route = inject(ActivatedRoute);
  protected authService = inject(AuthService);
  protected role = toSignal(this.authService.role);

  // course edit fields
  protected editName: string = '';
  protected editDescription: string = '';
  protected isEditing = signal(false);

  protected courseService = inject(CourseService);

  protected refresh$ = new BehaviorSubject<void>(undefined);
  private requirementList$: Observable<Requirement[] | null> = new Observable<Requirement[] | null>();
  protected requirements = toSignal(this.requirementList$);
  protected course = signal<Course | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) {
      console.error("course page: id was null");
      return;
    }

    this.requirementList$ = this.refresh$.pipe(
      switchMap(() => this.courseService.getRequirements(id))
    );
    this.requirements = toSignal(this.requirementList$);

    this.courseService.getCourse(id).subscribe(v => {
      if(!v) return;
      this.course.set(v);
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
}
