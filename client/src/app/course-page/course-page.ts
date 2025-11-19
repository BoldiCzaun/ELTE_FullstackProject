import { Component, inject, signal } from '@angular/core';
import { Course, CourseData, CourseService, Requirement, RequirementData } from '../course-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RequirementItem } from '../requirement-item/requirement-item';

@Component({
  selector: 'app-course-page',
  imports: [ReactiveFormsModule, FormsModule, DatePipe, RequirementItem],
  templateUrl: './course-page.html',
  styleUrl: './course-page.css'
})
export class CoursePage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected datePipe = new DatePipe('en-US');

  // course edit fields
  protected editName: string = '';
  protected editDescription: string = '';
  protected isEditing = signal(false);

  // requirement edit fields

  protected creationError = signal('');
  protected reqCreationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    begin: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm'), [Validators.required]),
    repeatCountEnabled: new FormControl(false, [Validators.required]),
    repeatCount: new FormControl(1, [Validators.required, Validators.min(1)]),
    weeksInBetween: new FormControl(1, [Validators.required, Validators.min(1)]),
    scoreWeight: new FormControl(50, [Validators.required, Validators.min(1), Validators.max(100)])
  });

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

  protected onSubmitRequirement() {
    let course = this.course();
    if (course == null) return;
    /*
    this.nameError.set('');
    this.maxStudentError.set('');
    */
    this.creationError.set('');

    const name = this.reqCreationForm.get('name');
    const begin = this.reqCreationForm.get('begin');
    const totalScoreWeight = this.reqCreationForm.get('scoreWeight');
    const repeatCount = this.reqCreationForm.get('repeatCount');
    const repeatSkip = this.reqCreationForm.get('weeksInBetween');

    if(name == null || begin == null || totalScoreWeight == null || repeatCount == null || repeatSkip == null) {
      console.error("err2");
      return;
    }
/*
    this.nameError.set(name.errors ? "Üres név!": "");
    this.maxStudentError.set(maxStudent.errors ? "Helytelen max diák szám! (minimum: 1)" : "");
*/
    if(name.errors || begin.errors) {
      console.error("err");
      return;
    }

    const nameValue = name.value;
    const beginValue = begin.value;
    const totalScoreWeightValue = totalScoreWeight.value;
    const repeatCountValue = repeatCount.value;
    const repeatSkipValue = repeatSkip.value;

    if(nameValue == null || beginValue == null || totalScoreWeightValue == null) return;
    
    const requirementData: RequirementData = {
      name: nameValue,
      begin: beginValue,
      total_score_weight: totalScoreWeightValue / 100.0,
      repeat_count: repeatCountValue,
      repeat_skip: repeatSkipValue,
    };

    this.courseService.storeRequirement(
      course.id.toString(),
      requirementData
    ).subscribe(success => {
      if(success) {
        this.refresh$.next();
        return;
      }

      this.creationError.set("error!");
    });
  }
}
