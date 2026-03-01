import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedimientoComponent } from './procedimiento';

describe('Procedimiento', () => {
  let component: ProcedimientoComponent;
  let fixture: ComponentFixture<ProcedimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcedimientoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
