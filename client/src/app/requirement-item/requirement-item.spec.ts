import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementItem } from './requirement-item';

describe('RequirementItem', () => {
  let component: RequirementItem;
  let fixture: ComponentFixture<RequirementItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
