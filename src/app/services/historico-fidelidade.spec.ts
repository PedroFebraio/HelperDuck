import { TestBed } from '@angular/core/testing';

import { HistoricoFidelidade } from './historico-fidelidade';

describe('HistoricoFidelidade', () => {
  let service: HistoricoFidelidade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricoFidelidade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
