import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeLayoutComponent} from '../layouts/home-layout/home-layout.component';
import {ActivityComponent} from '../activity/activity.component';
import {ReportComponent} from '../report/report.component';
import {IssueComponent} from '../issue/issue.component';
import {ActionComponent} from '../action/action.component';
import {ActivityFormComponent} from '../activity/activity-form.component';
import {ActivityDetailComponent} from '../activity/activity-detail.component';
import {ProjectSettingComponent} from '../setting/project-setting/project-setting.component';
import {SettingComponent} from '../setting/setting.component';
import {ResultAreaSettingComponent} from '../setting/result-area-setting/result-area-setting.component';
import {ActivitySettingComponent} from '../setting/activity-setting/activity-setting.component';
import {ObjectiveSettingComponent} from '../setting/objective-setting/objective-setting.component';
import {ReportIssueComponent} from '../issue/report-issue.component';
import {IssueActionComponent} from '../action/issue-action.component';
import {OutputSettingComponent} from '../setting/output-setting/output-setting.component';
import {IssueFormComponent} from '../issue/issue-form.component';

const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [{
      path: '',
      component: ActivityComponent,
    }, {
      path: 'activities',
      component: ActivityComponent,
    }, {path: 'activities/:id', component: ActivityDetailComponent}, {
      path: 'reports',
      component: ReportComponent,
    }, {
      path: 'issues',
      component: IssueComponent,
    }, {
      path: 'issues/:report',
      component: ReportIssueComponent,
    }, {
      path: 'actions',
      component: ActionComponent,
    }, {
      path: 'actions/:issue',
      component: IssueActionComponent,
    }, {
      path: 'add/activity', component: ActivityFormComponent
    }, {
      path: 'add/issue', component: IssueFormComponent
    }, {
      path: 'settings', component: SettingComponent,
      children: [
        {path: '', redirectTo: 'projects', pathMatch: 'full'},
        {path: 'projects', component: ProjectSettingComponent},
        {path: 'objectives', component: ObjectiveSettingComponent},
        {path: 'result_areas', component: ResultAreaSettingComponent},
        {path: 'outputs', component: OutputSettingComponent},
        {path: 'activities', component: ActivitySettingComponent}
      ]
    }]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
