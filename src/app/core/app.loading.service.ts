import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {Injectable} from '@angular/core';

@Injectable()
export class AppLoadingService {
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor() {
  }
}
