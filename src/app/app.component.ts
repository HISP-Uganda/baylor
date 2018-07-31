import {Component} from '@angular/core';
import {environment} from '../environments/environment';
import {BaylorStore} from './store/baylor.store';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary" *mobxAutorun>
      <span>Baylor Activity Tracker</span>
      <span class="example-spacer"></span>
      <a routerLink="/activities" mat-button routerLinkActive="active">Activities</a>
      <a routerLink="/reports" mat-button routerLinkActive="active">Reports</a>
      <a routerLink="/issues" mat-button routerLinkActive="active">Issues</a>
      <a routerLink="/actions" mat-button routerLinkActive="active">Actions</a>
      <a *ngIf="baylorStore.canSeeSettings" routerLink="/settings" mat-button routerLinkActive="active">Settings</a>
      <button mat-button [matMenuTriggerFor]="appMenu">
        <mat-icon>menu</mat-icon>
        Menu
      </button>
    </mat-toolbar>
    <mat-menu #appMenu="matMenu">
      <a mat-menu-item href="{{home}}">Home</a>
    </mat-menu>
    <div style="margin: 10px;">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  home = environment.dhis2;

  constructor(private baylorStore: BaylorStore) {
  }
}
