import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscenarioComponent } from './escenario';

describe('Escenario', () => {
  let component: EscenarioComponent;
  let fixture: ComponentFixture<EscenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscenarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscenarioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
