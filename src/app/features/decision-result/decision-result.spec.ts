import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionResult } from './decision-result';

describe('DecisionResult', () => {
  let component: DecisionResult;
  let fixture: ComponentFixture<DecisionResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
