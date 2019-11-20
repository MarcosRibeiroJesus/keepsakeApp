import { TestBed } from '@angular/core/testing';

import { DepoimentoService } from './depoimento.service';

describe('DepoimentoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DepoimentoService = TestBed.get(DepoimentoService);
    expect(service).toBeTruthy();
  });
});
