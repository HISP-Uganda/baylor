import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Router} from '@angular/router';
import {
  activityAttributes,
  AppLoadingService,
  Dhis2Service,
  mapEvents,
  mapOrgUnits,
  mapTrackedEntityInstances,
  reportDataElements
} from '../core';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {FieldActivityDialogComponent} from './dialogs.component';
import {environment} from '../../environments/environment';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {
  API_URL = environment.apiUrl + '/events/files?';
  events = {};
  activities = [];
  displayedColumns = [
    'activityCode',
    // 'transactionCode',
    'activity',
    'orgUnitName',
    'plannedStartDate',
    'plannedEndDate',
    // 'projectName',
    // 'resultArea',
    // 'objective',
    // 'implementor',
    'activityStatus',
    'action'
  ];

  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public loaderService: AppLoadingService,
              private baylorStore: BaylorStore,
              private api: Dhis2Service,
              public router: Router,
              public dialog: MatDialog) {
  }

  public ngOnInit() {

    let activities;
    let events;
    this.api
      .getAttributes('MLb410Oz6cU')
      .subscribe(
        (attributes) => {
          return attributes;
        }
      );

    this.api
      .getAllEvents('MLb410Oz6cU')
      .subscribe(
        (response) => {
          events = response;
        }, e => console.log(e), () => {
          events = mapEvents(events, reportDataElements);
          this.events = _.groupBy(events, 'trackedEntityInstance');
        });
    this.api
      .getTrackedEntities('MLb410Oz6cU')
      .subscribe(
        (response) => {
          activities = response;
        }, e => console.log(e), () => {
          activities = mapTrackedEntityInstances(activities, activityAttributes);
          let ous;
          activities = activities.map(r => {
            return {
              ...r,
              ...this.getStatus(r)
            };
          });
          this.api
            .getOrgUnits(activities[0].orgUnits)
            .subscribe(
              (orgUnits) => {
                ous = orgUnits;
              }, e => console.log(e), () => {
                ous = mapOrgUnits(ous);
                activities = activities.map((a) => {
                  return {
                    ...a,
                    orgUnitName: ous[a.orgUnit],
                    download: a.report && a.report.event && a.report.report
                      ? this.API_URL + 'eventUid=' + a.report.event + '&dataElementUid=yxGmEyvPfwl' : null,
                  };
                });
                this.activities = activities;
                this.dataSource = new MatTableDataSource<any>(activities);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              });
        });
  }

  getStatus(o) {
    let events = _.orderBy(this.events[o['trackedEntityInstance']], ['eventDate'], ['asc']);
    events = _.filter(events, function (e) {
      return e.reportStartDate !== null;
    });
    const date = Moment();
    if (events.length > 0) {
      return {activityStatus: 'complete', report: events[0]};
    } else {
      const d = Moment(o.plannedStartDate);
      if (d >= date) {
        if (d.diff(date, 'days') <= 7) {
          return {activityStatus: 'Upcoming'};
        } else {
          return {activityStatus: 'On schedule'};
        }
      } else {
        return {activityStatus: 'Overdue'};
      }
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  selectRow(row) {
    this.router.navigate(['/activities', row.attributes['VLWHxrfUs9T']]);
  }

  openEditDialog(actions, data): void {
    data = {...actions, ...data};
    const dialogRef = this.dialog.open(FieldActivityDialogComponent, {
      minWidth: '800px',
      hasBackdrop: true,
      data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const {index} = data;
        const submissionDate = result['submissionDate'];
        const plannedStartDate = result['plannedStartDate'];
        const plannedEndDate = result['plannedEndDate'];

        if (plannedStartDate instanceof Moment) {
          result['plannedStartDate'] = result['plannedStartDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(plannedStartDate) === '[object Date]') {
          result['plannedStartDate'] = Moment(plannedStartDate).format('YYYY-MM-DD');
        }

        if (plannedEndDate instanceof Moment) {
          result['plannedEndDate'] = result['plannedEndDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(plannedEndDate) === '[object Date]') {
          result['plannedEndDate'] = Moment(plannedEndDate).format('YYYY-MM-DD');
        }

        if (submissionDate instanceof Moment) {
          result['submissionDate'] = result['submissionDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(submissionDate) === '[object Date]') {
          result['submissionDate'] = Moment(submissionDate).format('YYYY-MM-DD');
        }
        this.activities[index] = result;
        this.dataSource = new MatTableDataSource<any>(this.activities);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;


      }
    });
  }

}
