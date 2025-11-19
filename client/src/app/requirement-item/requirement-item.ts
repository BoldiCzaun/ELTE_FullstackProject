import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { CourseService, Requirement, RequirementData } from '../course-service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requirement-item',
  imports: [FormsModule, DatePipe],
  templateUrl: './requirement-item.html',
  styleUrl: './requirement-item.css'
})
export class RequirementItem {
  public courseID = input.required<string>();
  public requirement = input.required<Requirement>();

  protected router = inject(Router);
  protected courseService = inject(CourseService);

  protected isEdited = signal(false);
  protected editName: string = '';
  protected editDate: string = '';
  protected editTotalWeight: number = 0;
  protected editError = signal('');

  @Output() onSave = new EventEmitter<Requirement>();

  protected startRequirementEdit() { 
    this.isEdited.set(true);
    this.editName = this.requirement().name;
    this.editDate = this.requirement().begin.slice(0, 16);
    this.editTotalWeight = this.requirement().total_score_weight * 100;
  }

  protected saveRequirementEdit() {
    if(!this.isEdited()) return;

    if (this.editName.length < 1) {
      this.editError.set('Name is too short!');
      return;
    }

    if(this.editTotalWeight < 1 || this.editTotalWeight > 100) {
      this.editError.set('Invalid score weight!');
      return;
    }

    this.isEdited.set(false);
    this.editError.set('');

    let requirementData: RequirementData = {
      name: this.editName,
      begin: this.editDate,
      total_score_weight: this.editTotalWeight / 100,
      repeat_count: null,
      repeat_skip: null
    };
    
    this.courseService.updateRequirements(this.courseID(), this.requirement().id.toString(), requirementData).subscribe(v => {
      if(!v) return;
      
      this.onSave.emit();
    });
  }

  protected openScores() {
    this.router.navigate(["course", this.courseID(), this.requirement().id, "scores"], {
      state: this.requirement()
    });
  }
}
