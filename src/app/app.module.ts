import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


import {AppComponent} from './app.component';
import {AppMaterialAppModule} from './core/app.material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppRoutingModule} from './core/app.routing.module';
import {HttpClientModule} from '@angular/common/http';
import {HomeLayoutComponent} from './layouts/home-layout/home-layout.component';
import {HomeComponent} from './home/home.component';
import {ActionComponent} from './action/action.component';
import {ActivityComponent} from './activity/activity.component';
import {ReportComponent} from './report/report.component';
import {IssueComponent} from './issue/issue.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {ActivityFormComponent} from './activity/activity-form.component';
import {DefaultTreeviewEventParser, TreeviewEventParser, TreeviewModule} from 'ngx-treeview';
import {NgSelectModule} from '@ng-select/ng-select';
import {FlexLayoutModule} from '@angular/flex-layout';

import {MobxAngularModule} from 'mobx-angular';
import { StorageServiceModule} from 'angular-webstorage-service';


import {ActivityDetailComponent} from './activity/activity-detail.component';
import {UploadModule} from './upload/upload.module';
import {SplitModule} from './split/split.module';

import {ProjectSettingComponent} from './setting/project-setting/project-setting.component';
import {SettingComponent} from './setting/setting.component';
import {ResultAreaSettingComponent} from './setting/result-area-setting/result-area-setting.component';
import {ActivitySettingComponent} from './setting/activity-setting/activity-setting.component';
import {ObjectiveSettingComponent} from './setting/objective-setting/objective-setting.component';

import {
  ActionDialogComponent,
  CommentDialogComponent,
  FieldActivityDialogComponent,
  IssueDialogComponent
} from './activity/dialogs.component';

import {
  ActivityDialogComponent,
  ObjectiveDialogComponent,
  OutputDialogComponent,
  ProjectDialogComponent,
  ResultAreaDialogComponent
} from './setting/dialogs.component';
import {ReportIssueComponent} from './issue/report-issue.component';
import {IssueActionComponent} from './action/issue-action.component';
import {CoreModule} from './core';
import {OutputSettingComponent} from './setting/output-setting/output-setting.component';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {BaylorStore} from './store/baylor.store';
import {IssueFormComponent} from './issue/issue-form.component';


export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    HomeLayoutComponent,
    HomeComponent,
    ActionComponent,
    ActivityComponent,
    ReportComponent,
    IssueComponent,
    ActivityFormComponent,
    ActivityDetailComponent,
    IssueDialogComponent,
    ActionDialogComponent,
    ProjectSettingComponent,
    SettingComponent,
    ResultAreaSettingComponent,
    ActivitySettingComponent,
    ObjectiveSettingComponent,
    ActivityDialogComponent,
    ProjectDialogComponent,
    ResultAreaDialogComponent,
    ObjectiveDialogComponent,
    ReportIssueComponent,
    IssueActionComponent,
    OutputDialogComponent,
    OutputSettingComponent,
    FieldActivityDialogComponent,
    IssueFormComponent,
    CommentDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MobxAngularModule,
    FlexLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppMaterialAppModule,
    AppRoutingModule,
    CoreModule,
    TreeviewModule.forRoot(),
    NgSelectModule,
    UploadModule,
    SplitModule,
    StorageServiceModule
  ],
  providers: [
    BaylorStore,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    {provide: TreeviewEventParser, useClass: DefaultTreeviewEventParser}

  ],
  entryComponents: [
    IssueDialogComponent,
    ActionDialogComponent,
    ActivityDialogComponent,
    ProjectDialogComponent,
    ResultAreaDialogComponent,
    ObjectiveDialogComponent,
    OutputDialogComponent,
    FieldActivityDialogComponent,
    CommentDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
