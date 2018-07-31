import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../environments/environment';
import {MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import * as _ from 'lodash';

import {activityAttributes, AppLoadingService, Dhis2Service, mapEvents, mapTrackedEntityInstances, reportDataElements} from '../core';
import {Router} from '@angular/router';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  dataSource = null;
  API_URL = environment.apiUrl + '/events/files?';

  events = [];
  issues = {};
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  displayedColumns = [
    'activity',
    'reportStartDate',
    'reportEndDate',
    'orgUnitName',
    'reportStatus',
    'action'
  ];

  constructor(public loaderService: AppLoadingService,
              private api: Dhis2Service,
              public dialog: MatDialog,
              public router: Router,
              private baylorStore: BaylorStore,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    let activities;
    this.api.getTrackedEntities('MLb410Oz6cU').subscribe(response => {
      activities = response;
    }, e => console.log(e), () => {
      activities = mapTrackedEntityInstances(activities, activityAttributes);
      let events;
      this.api
        .getAllEvents('MLb410Oz6cU')
        .subscribe(
          (response) => {
            events = response;
          }, e => console.log(e), () => {
            events = mapEvents(events, reportDataElements);
            events = events.map(e => {
              this.getNumberOfIssues(e.event);
              const entity = _.find(activities, {trackedEntityInstance: e.trackedEntityInstance});
              return {
                ...e, ...{
                  download: e.report ? this.API_URL + 'eventUid=' + e.event + '&dataElementUid=yxGmEyvPfwl' : null,
                  activity: entity['activity']
                }
              };
            });
            this.events = events;
            this.dataSource = new MatTableDataSource<any>(events);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  approveReport(report) {
    const dataValues = _.map(report.dataValues, (v) => {
      return {dataElement: v.dataElement, value: v.dataElement === reportDataElements.reportStatus ? 'Approved' : v.value};
    });
    const event = {
      trackedEntityInstance: report['trackedEntityInstance'],
      program: report['program'],
      orgUnit: report['orgUnit'],
      programStage: 'FxImolXHCbY',
      event: report.event,
      dataValues
    };

    this.api.postEvent(event).subscribe(e => {
    }, e => console.log(e), () => {
      const foundIndex = this.events.findIndex(x => x.trackedEntityInstance === report['trackedEntityInstance']);
      report['reportStatus'] = 'Approved';
      this.events[foundIndex] = report;

      this.dataSource = new MatTableDataSource<any>(this.events);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.snackBar.open('Report Approved', 'OK', {
        duration: 2000,
      });
    });
  }

  editReport(report) {
    this.router.navigate(['/activities', report.trackedEntityInstance]);
  }

  viewIssues(report) {
    this.router.navigate(['/issues', report.event]);

  }

  getNumberOfIssues(report) {
    let issues;

    this.api.issues(report).subscribe(response => {
      issues = response;
    }, e => console.log(e), () => {
      this.issues[report] = issues['trackedEntityInstances'].length;
    });
  }

}
