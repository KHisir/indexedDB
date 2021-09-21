/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CcIndexedDBService } from './cc-indexedDB.service';

describe('Service: CcIndexedDB', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CcIndexedDBService]
    });
  });

  it('should ...', inject([CcIndexedDBService], (service: CcIndexedDBService) => {
    expect(service).toBeTruthy();
  }));
});
