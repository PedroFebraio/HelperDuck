import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FidelidadePage } from './fidelidade.page';

describe('FidelidadePage', () => {
  let component: FidelidadePage;
  let fixture: ComponentFixture<FidelidadePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FidelidadePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
