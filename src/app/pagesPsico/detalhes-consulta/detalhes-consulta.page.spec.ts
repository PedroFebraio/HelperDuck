import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhesConsultaPage } from './detalhes-consulta.page';

describe('DetalhesConsultaPage', () => {
  let component: DetalhesConsultaPage;
  let fixture: ComponentFixture<DetalhesConsultaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhesConsultaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
