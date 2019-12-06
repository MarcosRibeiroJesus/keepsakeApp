import { TestBed } from '@angular/core/testing';

import { EventPhotoService } from './eventPhoto.service';

describe('EventPhotoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventPhotoService = TestBed.get(EventPhotoService);
    expect(service).toBeTruthy();
  });
});
