import { TestBed } from '@angular/core/testing';

import { Humor } from './humor';

describe('Humor', () => {
  let service: Humor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Humor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
