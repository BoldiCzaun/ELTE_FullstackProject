import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoresPage } from './scores-page';

describe('ScoresPage', () => {
  let component: ScoresPage;
  let fixture: ComponentFixture<ScoresPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoresPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
