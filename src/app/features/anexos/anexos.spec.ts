import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexosComponent } from './anexos';

describe('Anexos', () => {
  let component: AnexosComponent;
  let fixture: ComponentFixture<AnexosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnexosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnexosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
