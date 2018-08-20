import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ActionDialogComponent, IssueDialogComponent} from './dialogs.component';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {AppLoadingService, Dhis2Service, issueAttributes, reportDataElements} from '../core';
import {BaylorStore} from '../store/baylor.store';
import {generateUid} from '../core/uid';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-activity',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityDetailComponent implements OnInit {

  reportForm: FormGroup;

  issueColumns = ['issue', 'issueStatus', 'actions'];

  actionColumns = ['issue', 'action', 'currentIssueStatus'];

  maxDate = new Date();

  constructor(private api: Dhis2Service, public router: Router,
              private route: ActivatedRoute, private fb: FormBuilder,
              public dialog: MatDialog,
              private baylorStore: BaylorStore,
              public loaderService: AppLoadingService) {
  }

  public ngOnInit() {
    this.baylorStore.setBacking(false);
    this.route.paramMap.subscribe(params => {
      this.baylorStore.setCurrentActivity(params.get('id'));
    });
    if (this.baylorStore.reportFormData.event) {
      this.baylorStore.getReportIssues(this.baylorStore.reportFormData.event);
    }
    this.createForm();
  }

  openDialog(data): void {
    let enrollmentId = null;
    if (data.enrollments && data.enrollments.length > 0) {
      data = {...data, registrationDate: data.enrollments[0]['enrollmentDate']};
      enrollmentId = data.enrollments[0]['enrollment'];
    }
    data = {...data, activity: this.baylorStore.processedActivity['activity']};
    const dialogRef = this.dialog.open(IssueDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let date = result['registrationDate'];
        const expectedResolutionDate = result['expectedResolutionDate'];

        if (expectedResolutionDate instanceof Moment) {
          result['expectedResolutionDate'] = result['expectedResolutionDate'].format('YYYY-MM-DD');
        }

        result['reportedBy'] = this.baylorStore.userDetails['displayName'];

        if (date instanceof Moment) {
          date = result['registrationDate'].format('YYYY-MM-DD');
        }

        let attributes = [];
        let enrollments = [{
          enrollment: enrollmentId || generateUid(),
          orgUnit: this.baylorStore.currentActivity['orgUnit'],
          program: 'bsg7cZMTqgI',
          enrollmentDate: date,
          incidentDate: date
        }];

        if (data.enrollments && data.enrollments.length > 0) {
          enrollments = data.enrollments;
        }

        _.forOwn(issueAttributes, function (attribute, key) {
          if (result[key]) {
            attributes = [...attributes, {attribute, value: result[key]}];
          }
        });

        const trackedEntityInstance = {
          trackedEntityInstance: result['trackedEntityInstance'],
          orgUnit: this.baylorStore.currentActivity['orgUnit'],
          trackedEntityType: 'MCPQUTHX1Ze',
          attributes,
          enrollments
        };
        this.baylorStore.addIssue(trackedEntityInstance);
      }
    });
  }

  openActionDialog(data, issue): void {
    data.issue = issue.issue;
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const actionStartDate = result['actionStartDate'];
        const actionEndDate = result['actionEndDate'];

        if (actionEndDate instanceof Moment) {
          result['actionEndDate'] = result['actionEndDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(actionEndDate) === '[object Date]') {
          result['actionEndDate'] = Moment(actionEndDate).format('YYYY-MM-DD');
        }

        if (actionStartDate instanceof Moment) {
          result['actionStartDate'] = result['actionStartDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(actionStartDate) === '[object Date]') {
          result['actionStartDate'] = Moment(actionStartDate).format('YYYY-MM-DD');
        }
        this.baylorStore.addAction(issue, result);
      }
    });
  }

  createForm() {
    this.reportForm = this.fb.group({
      reportStartDate: [null, Validators.required],
      reportEndDate: [null, Validators.required],
      reportTitle: [this.baylorStore.processedActivity['activity'], Validators.required],
      reportDate: [Moment().format('YYYY-MM-DD'), Validators.required],
      achievementsSummary: [null],
      achievements: [null],
      constraints: [null],
      lessons: [null],
      reportStatus: ['Pending Approval']
    });
    this.reportForm.patchValue(this.baylorStore.reportFormData);
  }

  onFormSubmit(form: NgForm) {

    const rsd = form['reportStartDate'];
    const red = form['reportEndDate'];
    const rd = form['reportDate'];

    if (rsd instanceof Moment) {
      form['reportStartDate'] = form['reportStartDate'].format('YYYY-MM-DD');
    } else if (Object.prototype.toString.call(rsd) === '[object Date]') {
      form['reportStartDate'] = Moment(rsd).format('YYYY-MM-DD');
    }

    if (red instanceof Moment) {
      form['reportEndDate'] = form['reportEndDate'].format('YYYY-MM-DD');
    } else if (Object.prototype.toString.call(red) === '[object Date]') {
      form['reportEndDate'] = Moment(red).format('YYYY-MM-DD');
    }

    if (rd instanceof Moment) {
      form['reportDate'] = form['reportDate'].format('YYYY-MM-DD');
    } else if (Object.prototype.toString.call(rd) === '[object Date]') {
      form['reportDate'] = Moment(rd).format('YYYY-MM-DD');
    }
    let dataValues = [];
    _.forOwn(reportDataElements, function (dataElement, key) {
      if (form[key]) {
        dataValues = [...dataValues, {dataElement, value: form[key]}];
      }
    });

    const event = {
      trackedEntityInstance: this.baylorStore.currentActivity['trackedEntityInstance'],
      event: this.baylorStore.reportFormData.event || generateUid(),
      program: 'MLb410Oz6cU',
      orgUnit: this.baylorStore.currentActivity['orgUnit'],
      programStage: 'FxImolXHCbY',
      eventDate: form['reportDate'],
      dataValues
    };
    this.baylorStore.addReport(event);
  }

  filter(val: string): Observable<any[]> {
    return this.api.getOptions('cm9EILDQe8K')
      .pipe(
        map(response => response.filter(option => {
          return option.code.toLowerCase().indexOf(val.toLowerCase()) === 0;
        }))
      );
  }

  back() {
    this.baylorStore.setBacking(true);
    this.router.navigate(['/activities']);
  }

  myFilter = (d): boolean => {
    const startDate = this.reportForm.get('reportStartDate').value;
    if (startDate) {
      if (startDate instanceof Moment) {
        return d >= startDate && d <= Moment();
      } else {
        return d.format('YYYY-MM-DD') >= startDate && d.format('YYYY-MM-DD') <= Moment().format('YYYY-MM-DD');
      }
    }
    return false;
  };
}
