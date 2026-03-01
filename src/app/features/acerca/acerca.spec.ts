import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcercaComponent } from './acerca';

describe('Acerca', () => {
  let component: AcercaComponent;
  let fixture: ComponentFixture<AcercaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcercaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcercaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
