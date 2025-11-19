import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CourseService, RequirementData } from '../course-service';

@Component({
  selector: 'app-create-requirement',
  imports: [ReactiveFormsModule],
  templateUrl: './create-requirement.html',
  styleUrl: './create-requirement.css'
})
export class CreateRequirement {
  public courseID = input.required<string>();

  protected datePipe = new DatePipe('en-US');
  protected courseService = inject(CourseService);

  protected creationError = signal('');

  protected reqCreationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    begin: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm'), [Validators.required]),
    repeatCountEnabled: new FormControl(false, [Validators.required]),
    repeatCount: new FormControl(1, [Validators.required, Validators.min(1)]),
    weeksInBetween: new FormControl(1, [Validators.required, Validators.min(1)]),
    scoreWeight: new FormControl(50, [Validators.required, Validators.min(1), Validators.max(100)])
  });

  @Output() onCreation = new EventEmitter();

  constructor() {
    this.onRepeatCountEnableChanged();
  }

  protected onSubmitRequirement() {
    this.creationError.set('');

    const name = this.reqCreationForm.get('name')!;
    const begin = this.reqCreationForm.get('begin')!;
    const totalScoreWeight = this.reqCreationForm.get('scoreWeight')!;
    const repeatCountEnabled = this.reqCreationForm.get('repeatCountEnabled')!;
    const repeatCount = this.reqCreationForm.get('repeatCount')!;
    const repeatSkip = this.reqCreationForm.get('weeksInBetween')!;

    if(name.errors) {
      this.creationError.set('Name cannot be empty!');
      return;
    }

    if(begin.errors) {
      this.creationError.set('Begin date cannot be empty!');
      return;
    }

    if(totalScoreWeight.errors) {
      this.creationError.set('Invalid score weight (needs to be between 1 and 100)!');
      return;
    }

    const repeatCountEnabledValue = repeatCountEnabled.value!;

    if(repeatCountEnabledValue) {
      if(repeatCount.errors) {
        this.creationError.set('Invalid repeat count! (must be 1 or higher)');
        return;
      }

      if(repeatSkip.errors) {
        this.creationError.set('Invalid weeks in-between value! (must be 1 or higher)');
        return;
      }
    }

    this.creationError.set('');

    const nameValue = name.value!;
    const beginValue = begin.value!;
    const totalScoreWeightValue = totalScoreWeight.value!;
    const repeatCountValue = repeatCount.value;
    const repeatSkipValue = repeatSkip.value;

    if(repeatCountEnabled && repeatSkipValue != null && repeatCountValue == null) {
      this.creationError.set('Weeks in-between cannot be set without setting repeat count!');
      return;
    }
    
    const requirementData: RequirementData = {
      name: nameValue,
      begin: beginValue,
      total_score_weight: totalScoreWeightValue / 100.0,
      repeat_count: !repeatCountEnabledValue ? null : repeatCountValue,
      repeat_skip: !repeatCountEnabledValue ? null : repeatSkipValue,
    };

    this.courseService.storeRequirement(
      this.courseID(),
      requirementData
    ).subscribe(success => {
      if(success) {
        this.onCreation.emit();
        return;
      }

      this.creationError.set("error!");
    });
  }

  protected onRepeatCountEnableChanged() {
    const countEnabled = this.reqCreationForm.get('repeatCountEnabled')?.value;
    const isDisabled = countEnabled != null ? !countEnabled : true;
    const repeatCount = this.reqCreationForm.get('repeatCount')!;
    const weeksInBetween = this.reqCreationForm.get('weeksInBetween')!;

    if (!isDisabled) {
      repeatCount.enable();
      weeksInBetween.enable();
    } else {
      repeatCount.disable();
      weeksInBetween.disable();
    }
  }
}
