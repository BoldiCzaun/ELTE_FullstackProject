import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeCoursePage } from './take-course-page';

describe('TakeCoursePage', () => {
  let component: TakeCoursePage;
  let fixture: ComponentFixture<TakeCoursePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeCoursePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TakeCoursePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
