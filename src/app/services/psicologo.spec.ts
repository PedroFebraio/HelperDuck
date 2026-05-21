import { TestBed } from '@angular/core/testing';

import { Psicologo } from './psicologo';

describe('Psicologo', () => {
  let service: Psicologo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Psicologo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
