import { TestBed } from '@angular/core/testing';

import { BitmexService } from './bitmex.service';

describe('BitmexService', () => {
  let service: BitmexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitmexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
