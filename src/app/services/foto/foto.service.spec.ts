import { TestBed } from '@angular/core/testing';

import { FotoService } from './foto.service';

describe('FotoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FotoService = TestBed.get(FotoService);
    expect(service).toBeTruthy();
  });
});
