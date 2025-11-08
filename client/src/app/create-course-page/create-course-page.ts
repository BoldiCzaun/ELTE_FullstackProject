import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course, CourseService } from '../course-service';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-create-course-page',
  imports: [ReactiveFormsModule],
  templateUrl: './create-course-page.html',
  styleUrl: './create-course-page.css'
})
export class CreateCoursePage {
  protected router = inject(Router);
  protected courseService = inject(CourseService);
  protected authService = inject(AuthService);

  protected nameError = signal('');
  protected maxStudentError = signal('');
  protected creationError = signal('');

  protected courseCreationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', []),
    maxStudent: new FormControl(10, [Validators.required, Validators.min(1)])
  });

  protected onSubmit() {
    this.nameError.set('');
    this.maxStudentError.set('');
    this.creationError.set('');

    const name = this.courseCreationForm.get('name');
    const description = this.courseCreationForm.get('description');
    const maxStudent = this.courseCreationForm.get('maxStudent');

    if(!description || !maxStudent || !name) {
      return;
    }

    this.nameError.set(name.errors ? "Üres név!": "");
    this.maxStudentError.set(maxStudent.errors ? "Helytelen max diák szám! (minimum: 1)" : "");

    if(name.errors || maxStudent.errors) {
      return;
    }

    const descriptionValue = description?.value;
    const nameValue = name?.value;
    const maxStudentValue  = maxStudent?.value;
    
    if(descriptionValue != null && nameValue && maxStudentValue) {
      const user_id = this.authService.user.value?.id;
      if(!user_id) {
        console.error("user id is not valid!!");
        return;
      }

      const course: Course = {
        name: nameValue,
        description: descriptionValue,
        max_student: maxStudentValue,
        user_id: user_id,

        // ezek nem kellenek a store-hoz
        // nem tudom hogy jobb lett volna ezt paramétereken keresztül átadni
        // vagy más tipust használni?
        // (kötelező volt inicializáljam őket)
        id: 0,
        students_count: 0
      };

      console.log(course);
      this.courseService.store(
        course
      ).subscribe(success => {
        if(success) {
          this.router.navigate(["/"]);
          return;
        }

        this.creationError.set("Hiba tárgy készitéskor!");
      });
    }
  }
}
