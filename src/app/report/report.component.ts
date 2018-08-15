import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';

import {activityAttributes, AppLoadingService, reportDataElements} from '../core';
import {Router} from '@angular/router';
import {BaylorStore} from '../store/baylor.store';
import {CommentDialogComponent} from '../activity/dialogs.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  displayedColumns = [
    'activity',
    'reportStartDate',
    'reportEndDate',
    'orgUnitName',
    'reportStatus',
    'implementor',
    'action'
  ];

  constructor(public loaderService: AppLoadingService,
              public router: Router,
              private baylorStore: BaylorStore, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.baylorStore.setPageInfo({previousPageIndex: null, pageIndex: 0, pageSize: 5});
    this.baylorStore.setActivitySearches([{
      attribute: activityAttributes.activityStatus,
      operator: 'IN',
      value: 'Report Submitted;Report Approved'
    }]);
    this.baylorStore.fetchActivities();
  }

  changeReport(report, change) {
    this.baylorStore.setCurrentActivity(report);

    let formData = this.baylorStore.reportFormData;

    formData = {...formData, ...change};

    let dataValues = [];
    _.forOwn(reportDataElements, function (dataElement, key) {
      if (formData[key]) {
        dataValues = [...dataValues, {dataElement, value: formData[key]}];
      }
    });

    const event = {
      trackedEntityInstance: this.baylorStore.currentActivity['trackedEntityInstance'],
      event: this.baylorStore.reportFormData.event,
      program: 'MLb410Oz6cU',
      orgUnit: this.baylorStore.currentActivity['orgUnit'],
      programStage: 'FxImolXHCbY',
      eventDate: formData['reportDate'],
      dataValues
    };

    this.baylorStore.approveReport(event, change);
  }

  editReport(report) {
    this.baylorStore.setCurrentActivity(report.trackedEntityInstance);
    this.router.navigate(['/activities', report.trackedEntityInstance]);
  }

  viewIssues(report) {
    this.router.navigate(['/issues', report.event]);

  }

  openCommentBox(trackedEntityInstance, comment): void {
    const data = {comment};
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.changeReport(trackedEntityInstance, result);
      }
    });
  }
}
