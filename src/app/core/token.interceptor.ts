import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';


import {Observable} from 'rxjs/internal/Observable';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: 'Basic ' + btoa('carapai:Charles@123$')
      }
    });
    return next.handle(request);
  }

}
