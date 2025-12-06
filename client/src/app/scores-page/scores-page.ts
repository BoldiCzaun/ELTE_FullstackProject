import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course, CourseService, Requirement, Score, ScoreData } from '../course-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../user-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import {AuthService} from '../auth-service';

@Component({
  selector: 'app-scores-page',
  imports: [ReactiveFormsModule],
  templateUrl: './scores-page.html',
  styleUrl: './scores-page.css'
})
export class ScoresPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected courseService = inject(CourseService);
  protected authService = inject(AuthService);
  protected role = toSignal(this.authService.role);

  protected scoreCreationForm = new FormGroup({
    score: new FormControl(50, [Validators.required]),
    user_id: new FormControl(0, [Validators.required]),
    requirement_num: new FormControl(0, [Validators.min(0)])
  });

  protected scoreEditForm = new FormGroup({
    score: new FormControl(50, [Validators.required]),
  });

  protected selectedEdit = signal<number | null>(null);

  private courseID: string = "";
  private requirementID: string = "";

  protected requirement: Requirement | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private scoreList$: Observable<Score[] | null> = new Observable<Score[] | null>();
  protected scores = toSignal(this.scoreList$);
  protected students = signal<User[] | null>(null);

  updateEditFields() {
    let valid = this.getValidStudents();
    if (valid == null || !valid.length) return;

    let current_req_num = this.scoreCreationForm.get('requirement_num')?.value;
    let current_user_id = this.scoreCreationForm.get('user_id')?.value;
    let old_requirement_nums = current_user_id ? this.getRequirementNum(current_user_id) : [];//.filter(v => v != current_req_num) : [];

    if (current_user_id == null || old_requirement_nums.length == 0 || !valid.map(v => v.id).includes(+current_user_id)) {
      current_user_id = valid[0].id;
      current_req_num = -1;
    }

    let requirement_nums = this.getRequirementNum(current_user_id);

    this.scoreCreationForm.patchValue({
      user_id: current_user_id,
      requirement_num: requirement_nums[0]
    })
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) {
      console.error("scores page: id was null");
      return;
    }

    this.courseID = id;

    const req_id = this.route.snapshot.paramMap.get('req_id');
    if(!req_id) {
      console.error("scores page: req_id was null");
      return;
    }

    this.requirementID = req_id;

    this.scoreList$ = this.refresh$.pipe(
      switchMap(() => this.courseService.getCourseScores(id, req_id))
    );
    this.scores = toSignal(this.scoreList$);

    effect(() => {
      this.scores();
      this.updateEditFields();
    });

    this.requirement = this.router.currentNavigation()?.extras.state as Requirement | null;

    this.courseService.getStudents(id).subscribe(v => {
      if(!v) return;

      this.students.set(v);

      let requirement_nums = this.getRequirementNum(v[0].id);

      this.scoreCreationForm.patchValue({
        user_id: v[0].id,
        requirement_num: requirement_nums[0]
      })
    });
  }

  getRequirementNum(user_id: number) {
    let all_req_nums = [...Array(this.requirement?.repeat_count).keys()];

    let used_req_nums = this.scores()?.
      filter(e => e.user_id == user_id).
      flatMap(e => e.requirement_num);

    return all_req_nums.filter(e => !used_req_nums?.includes(e));
  }

  getRequirementNumForUserId() {
    const user_id = this.scoreCreationForm.get('user_id')?.value;
    if(user_id == null || this.requirement?.repeat_count == null) return [];

    return this.getRequirementNum(user_id);
  }

  getValidStudents() {
    return this.students()?.filter(s => this.getRequirementNum(s.id).length > 0)
  }

  setEdit(id: number) {
    this.selectedEdit.set(id);

    this.scoreEditForm.patchValue({
      score: this.scores()?.find(v => v.id == id)?.score
    })
  }

  saveEdit() {
    let selectedEdit = this.selectedEdit();
    if(selectedEdit == null) return;

    let score = this.scoreEditForm.get('score')?.value;
    if(score == null) return;

    this.courseService.updateScore(this.courseID, this.requirementID, selectedEdit.toString(), score).subscribe(v => {
      if(!v) return;
      this.selectedEdit.set(null);
      this.refresh$.next();
    });
  }

  onSubmit() {
    const score = this.scoreCreationForm.get('score');
    const user_id = this.scoreCreationForm.get('user_id');
    const requirement_num = this.scoreCreationForm.get('requirement_num');

    if(!score || !user_id || !requirement_num) {
      return;
    }

    const scoreValue = score?.value;
    const userIDValue = user_id?.value;
    const requirementNumValue = requirement_num?.value;

    if(scoreValue != null && userIDValue != null && requirementNumValue != null) {
      const scoreData: ScoreData = {
        score: scoreValue,
        user_id: userIDValue,
        requirement_num: requirementNumValue
      };

      this.courseService.storeScore(
        this.courseID, this.requirementID, scoreData
      ).subscribe(success => {
        if(success) {
          this.updateEditFields();
          this.refresh$.next();
          return;
        }

        // this.creationError.set("Hiba tárgy készitéskor!");
      });
    }
  }
}
