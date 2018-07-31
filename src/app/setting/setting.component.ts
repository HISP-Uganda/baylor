import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-setting',
  template: `
    <mat-drawer-container>
      <mat-drawer mode="side" opened="true">
        <mat-nav-list>
          <a mat-list-item [routerLink]="['projects']" routerLinkActive="active">Projects</a>
          <a mat-list-item [routerLink]="['outputs']" routerLinkActive="active">Project Outputs</a>
          <a mat-list-item [routerLink]="['objectives']" routerLinkActive="active">Objectives</a>
          <a mat-list-item [routerLink]="['result_areas']" routerLinkActive="active">Result Areas</a>
          <a mat-list-item [routerLink]="['activities']" routerLinkActive="active">Activities</a>
        </mat-nav-list>
      </mat-drawer>
      <mat-drawer-content>
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrls: []
})
export class SettingComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
