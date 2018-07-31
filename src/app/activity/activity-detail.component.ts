import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ActionDialogComponent, IssueDialogComponent} from './dialogs.component';
import {environment} from '../../environments/environment';
import {distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {
  actionDataElements,
  activityAttributes,
  AppLoadingService,
  Dhis2Service,
  issueAttributes,
  mapEvents2,
  mapTrackedEntityInstance,
  mapTrackedEntityInstances,
  reportDataElements
} from '../core';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-activity',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityDetailComponent implements OnInit {
  activity = {};
  report;
  reportStatuses: Observable<any[]>;
  actions = [];
  activities = [];
  issues = [];
  orgUnits = {};
  issue = null;
  dataSource = null;
  actionDataSource = null;
  showReport = false;

  selectedActivity = {};
  selectedReport = null;
  selectedIssue = null;

  formLabel = 'Save';
  API_URL = environment.apiUrl + '/events/files?';

  reportForm: FormGroup;

  issueColumns = ['issue', 'issueStatus', 'actions'];

  actionColumns = ['issue', 'action', 'currentIssueStatus'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator) actionPaginator: MatPaginator;
  @ViewChild(MatSort) actionSort: MatSort;

  maxDate = new Date();

  constructor(private api: Dhis2Service, public router: Router,
              private route: ActivatedRoute, private fb: FormBuilder,
              public dialog: MatDialog, public snackBar: MatSnackBar,
              private baylorStore: BaylorStore,
              public loaderService: AppLoadingService) {
  }

  // ngAfterViewInit(): void {
  //   this.cdr.detectChanges();
  // }

  public ngOnInit() {

    this.getReport();

    this.reportStatuses = this.reportForm.get('reportStatus').valueChanges
      .pipe(
        startWith(null),
        distinctUntilChanged(),
        switchMap(val => {
          return this.filter(val || '');
        })
      );

    this.api.getUserDetails().subscribe(u => {
    });
  }

  getReport() {
    this.createForm();
    const reportStartDate = this.reportForm.get('reportStartDate');
    const reportEndDate = this.reportForm.get('reportEndDate');
    const reportDate = this.reportForm.get('reportDate');
    const reportTitle = this.reportForm.get('reportTitle');
    const achievementsSummary = this.reportForm.get('achievementsSummary');
    const achievements = this.reportForm.get('achievements');
    const constraints = this.reportForm.get('constraints');
    const lessons = this.reportForm.get('lessons');
    const reportStatus = this.reportForm.get('reportStatus');
    let events = [];
    this.route.paramMap.subscribe(params => {
      this.api.getTrackedEntity(params.get('id')).subscribe((response) => {
        this.selectedActivity = response;
      }, e => console.log(e), () => {
        this.selectedActivity = mapTrackedEntityInstance(this.selectedActivity, activityAttributes);
      });

      this.api
        .getEvents(params.get('id'))
        .subscribe(
          (response) => {
            events = response;
          }, e => console.log(e), () => {
            events = mapEvents2(events, reportDataElements);
            if (events.length > 0) {
              let issues = [];
              this.report = events[0];
              this.selectedReport = events[0];
              this.API_URL = this.API_URL + 'eventUid=' + this.selectedReport.event + '&dataElementUid=yxGmEyvPfwl';
              this.showReport = true;
              this.formLabel = 'Update Report';
              reportStartDate.setValue(this.report['reportStartDate'] || '');
              reportEndDate.setValue(this.report['reportEndDate'] || '');
              reportDate.setValue(this.report['reportDate'] || '');
              reportTitle.setValue(this.report['reportTitle'] || '');
              achievementsSummary.setValue(this.report['achievementsSummary'] || '');
              achievements.setValue(this.report['achievements'] || '');
              constraints.setValue(this.report['constraints'] || '');
              lessons.setValue(this.report['lessons'] || '');
              reportStatus.setValue(this.report['reportStatus'] || 'Pending Approval');
              this.api.issues(this.selectedReport['event']).subscribe(response => {
                issues = response;
              }, e => console.log(e), () => {
                issues = mapTrackedEntityInstances(issues, issueAttributes);
                this.dataSource = new MatTableDataSource<any>(issues);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              });
            }
          });
    });
  }

  openDialog(data): void {
    data.transactionCode = this.selectedActivity['transactionCode'];
    data.report = this.selectedReport;
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
        } else if (Object.prototype.toString.call(expectedResolutionDate) === '[object Date]') {
          result['expectedResolutionDate'] = Moment(expectedResolutionDate).format('YYYY-MM-DD');
        }

        if (date instanceof Moment) {
          date = result['registrationDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(expectedResolutionDate) === '[object Date]') {
          date = Moment(date).format('YYYY-MM-DD');
        }

        let attributes = [];
        const enrollments = [{
          orgUnit: this.activity['orgUnit'],
          program: 'bsg7cZMTqgI',
          enrollmentDate: date,
          incidentDate: date
        }];

        _.forOwn(issueAttributes, function (attribute, key) {
          if (result[key]) {
            attributes = [...attributes, {attribute, value: result[key]}];
          }
        });
        const trackedEntityInstance = {
          orgUnit: this.selectedReport['orgUnit'],
          trackedEntityType: 'MCPQUTHX1Ze',
          attributes,
          enrollments
        };
        if (result.trackedEntityInstance) {
          trackedEntityInstance['trackedEntityInstance'] = result.trackedEntityInstance;
        }

        const instances = {trackedEntityInstances: [trackedEntityInstance]};

        this.api.postTrackedEntity(instances).subscribe(hero => {
        }, error => {
          this.snackBar.open(error, 'Failed to save or update issue', {
            duration: 2000,
          });
        }, () => {
          this.getReport();
          this.snackBar.open('Issue saved successfully', 'OK', {
            duration: 2000,
          });
        });
      }
    });
  }

  openActionDialog(data, issue): void {
    this.selectedIssue = issue;
    data.issue = issue.issue;
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const ecd = result['actionStartDate'];
        const od = result['actionEndDate'];

        if (ecd instanceof Moment) {
          result['actionStartDate'] = result['actionStartDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(ecd) === '[object Date]') {
          result['actionStartDate'] = Moment(ecd).format('YYYY-MM-DD');
        }

        if (od instanceof Moment) {
          result['actionEndDate'] = result['actionEndDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(od) === '[object Date]') {
          result['actionEndDate'] = Moment(od).format('YYYY-MM-DD');
        }

        let dataValues = [];
        _.forOwn(actionDataElements, function (dataElement, key) {
          if (result[key]) {
            dataValues = [...dataValues, {dataElement, value: result[key]}];
          }
        });

        let event = {
          trackedEntityInstance: this.selectedIssue.trackedEntityInstance,
          program: 'bsg7cZMTqgI',
          orgUnit: this.selectedIssue.orgUnit,
          programStage: 'KO6z9FXmPLv',
          eventDate: result['eventDate'] || Moment().format('YYYY-MM-DD'),
          dataValues
        };

        if (result.event) {
          event['event'] = result.event;
        }

        this.api.postEvent(event).subscribe(e => {
        }, error => {
          this.snackBar.open(error, 'Failed', {
            duration: 2000,
          });
        }, () => {
          this.snackBar.open('Action saved successfully', 'OK', {
            duration: 2000,
          });
          if (result.currentIssueStatus) {
            const attributes = _.map(this.selectedIssue.attributes, (value, key) => (
              {attribute: key, value: key === issueAttributes.issueStatus ? result.currentIssueStatus : value}
            ));

            const trackedEntityInstance = {
              orgUnit: this.selectedReport['orgUnit'],
              trackedEntityInstance: this.selectedIssue.trackedEntityInstance,
              trackedEntityType: 'MCPQUTHX1Ze',
              attributes,
            };

            this.api.postTrackedEntity(trackedEntityInstance).subscribe(hero => {
              this.getReport();
              this.snackBar.open('Issue updated successfully', 'OK', {
                duration: 2000,
              });
            }, error => {
              this.snackBar.open(error, 'Failed to save or update issue', {
                duration: 2000,
              });
            });
            this.getReport();
          }
        });
      }
    });
  }

  createForm() {
    this.reportForm = this.fb.group({
      reportStartDate: [null, Validators.required],
      reportEndDate: [null, Validators.required],
      reportTitle: [null, Validators.required],
      reportDate: [null, Validators.required],
      achievementsSummary: [null],
      achievements: [null],
      constraints: [null],
      lessons: [null],
      reportStatus: ['Pending Approval']
    });
  }

  updateIssue(issueId, attributes) {
    const trackedEntityInstanceUpdate = {
      orgUnit: this.selectedReport['orgUnit'],
      attributes,
    };

    this.api.updateTrackedEntity(issueId, trackedEntityInstanceUpdate).subscribe(hero => {
      this.snackBar.open('Issue updated successfully', 'OK', {
        duration: 2000,
      });
    }, error => {
      this.snackBar.open(error, 'Failed', {
        duration: 2000,
      });
    });
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
      trackedEntityInstance: this.selectedActivity['trackedEntityInstance'],
      program: 'MLb410Oz6cU',
      orgUnit: this.selectedActivity['orgUnit'],
      status: 'COMPLETED',
      programStage: 'FxImolXHCbY',
      eventDate: form['reportDate'],
      dataValues
    };

    if (this.selectedReport !== null) {
      event['event'] = this.selectedReport.event;
    }

    this.api.postEvent(event).subscribe(e => {
      // const ref = e['response']['importSummaries'][0]['reference'];
      this.getReport();
      this.snackBar.open('Report updated successfully', 'OK', {
        duration: 2000,
      });
    });

  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  filter(val: string): Observable<any[]> {
    return this.api.getOptions('cm9EILDQe8K')
      .pipe(
        map(response => response.filter(option => {
          return option.code.toLowerCase().indexOf(val.toLowerCase()) === 0;
        }))
      );
  }

  approveReport() {
    if (this.selectedReport.event !== null) {
      const dataValues = [{dataElement: reportDataElements.reportStatus, value: 'Approved'}];
      const event = {
        trackedEntityInstance: this.selectedActivity['trackedEntityInstance'],
        program: 'MLb410Oz6cU',
        orgUnit: this.selectedActivity['orgUnit'],
        programStage: 'FxImolXHCbY',
        event: this.selectedReport.event,
        dataValues
      };

      this.api.postEvent(event).subscribe(e => {

      }, e => console.log(e), () => {
        this.getReport();
        this.snackBar.open('Report Appproved', 'OK', {
          duration: 2000,
        });
      });
    }
  }

  selectIssue(row) {
    let actions;
    if (row) {
      this.selectedIssue = row;
      this.api.getEvents(row.trackedEntityInstance).subscribe((response) => {
        actions = response;
      }, e => console.log(e), () => {
        actions = mapEvents2(actions, actionDataElements);
        actions = actions.map(e => {
          e.issue = row.issue;
          return e;
        });
        this.actions = actions;
        console.log(actions);
        this.actionDataSource = new MatTableDataSource<any>(actions);
        this.actionDataSource.paginator = this.actionPaginator;
        this.actionDataSource.sort = this.actionSort;
      });
    }
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
