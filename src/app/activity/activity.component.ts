import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {AppLoadingService} from '../core';
import * as Moment from 'moment';
import {FieldActivityDialogComponent} from './dialogs.component';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {
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
    'implementor',
    'activityStatus',
    // 'oldActivityStatus',
    'action'
  ];

  constructor(public loaderService: AppLoadingService,
              private baylorStore: BaylorStore,
              public router: Router,
              public dialog: MatDialog) {

  }

  public ngOnInit() {
    this.baylorStore.setActivitySearches([]);
    this.baylorStore.fetchActivities();
    this.baylorStore.setBacking(false);
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
        this.baylorStore.changeActivities(result);
      }
    });
  }

  viewReport(activityId) {
    this.baylorStore.setFormLabel('Update');
    this.router.navigate(['/activities', activityId]);
  }
}
