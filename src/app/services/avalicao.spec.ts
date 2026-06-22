import { TestBed } from '@angular/core/testing';

import { Avalicao } from './avalicao';

describe('Avalicao', () => {
  let service: Avalicao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Avalicao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
