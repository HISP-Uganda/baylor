import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AppLoadingService} from './app.loading.service';
import {AppLoadingInterceptorService} from './app.loading-interceptor.service';
import {AppMaterialAppModule} from './app.material.module';
import {Dhis2Service} from './dhis2.service';
import {TokenInterceptor} from './token.interceptor';

@NgModule({
  imports: [AppMaterialAppModule],
  providers: [
    AppLoadingService,
    Dhis2Service,
    /*{
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },*/
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppLoadingInterceptorService,
      multi: true
    }
  ]
})
export class CoreModule {
}

export * from './app.loading.service';
export * from './dhis2.service';
export * from './constants';
export * from './common';
