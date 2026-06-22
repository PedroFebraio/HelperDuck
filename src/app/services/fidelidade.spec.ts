import { TestBed } from '@angular/core/testing';

import { Fidelidade } from './fidelidade';

describe('Fidelidade', () => {
  let service: Fidelidade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fidelidade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
