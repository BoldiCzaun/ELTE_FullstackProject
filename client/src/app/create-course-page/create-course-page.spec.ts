import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCoursePage } from './create-course-page';

describe('CreateCoursePage', () => {
  let component: CreateCoursePage;
  let fixture: ComponentFixture<CreateCoursePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCoursePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCoursePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
