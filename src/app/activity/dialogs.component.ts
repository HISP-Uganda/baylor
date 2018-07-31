import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import * as Moment from 'moment';
import {AppLoadingService, Dhis2Service} from '../core';
import * as _ from 'lodash';
import {Observable} from 'rxjs/internal/Observable';

@Component({
  selector: 'app-field-report-dialog',
  templateUrl: 'field-activity-dialog.html',
})
export class FieldActivityDialogComponent implements OnInit, AfterViewInit {
  activityForm: FormGroup;

  positions: Observable<any[]>;
  users: Observable<any[]>;
  orgUnits = [];
  currentUser = {};
  activities = [];
  projects = [];
  resultAreas = [];
  objectives = [];

  maxDate = new Date();

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService,
              private api: Dhis2Service,
              public dialogRef: MatDialogRef<FieldActivityDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    this.api
      .getFromDataStore('baylor', 'activities')
      .subscribe(
        (activities) => {
          this.activities = activities;
        }, error1 => console.log(error1), () => {
        });

    this.api
      .getFromDataStore('baylor', 'projects')
      .subscribe(
        (projects) => {
          this.projects = projects;
        }, error1 => console.log(error1), () => {
        });

    this.api
      .getFromDataStore('baylor', 'resultAreas')
      .subscribe(
        (resultAreas) => {
          this.resultAreas = resultAreas;
        }, error1 => console.log(error1), () => {
        });

    this.api
      .getFromDataStore('baylor', 'objectives')
      .subscribe(
        (objectives) => {
          this.objectives = objectives;
        }, error1 => console.log(error1), () => {
        });

    this.api.getUserDetails().subscribe(u => {
      const submittedBy = this.activityForm.get('submittedBy');
      submittedBy.setValue(u['displayName']);
    });

    this.api.getOptions('ohw99gJ7W8F').subscribe(response => {
      this.positions = response['options'];
    });

    this.api.getAllUserDetails().subscribe(response => {
      this.users = response['users'];
    });
    this.createForm();

    this.activityForm.controls['activityCode'].valueChanges.subscribe((value) => {
      const {resultArea, activityName, activityCode} = _.find(this.activities, {activityCode: value});
      const {objective} = _.find(this.resultAreas, {resultAreaCode: resultArea.resultAreaCode});
      const {project} = _.find(this.objectives, {objectiveCode: objective.objectiveCode});
      this.activityForm.controls['resultArea'].patchValue(resultArea.resultAreaCode + ' - ' + resultArea.resultAreaName);
      this.activityForm.controls['objective'].patchValue(objective.objectiveCode + ' - ' + objective.objectiveName);
      this.activityForm.controls['activity'].patchValue(activityCode + ' - ' + activityName);
      this.activityForm.controls['projectName'].patchValue(project.projectCode + ' - ' + project.projectName);
    });
  }

  ngAfterViewInit(): void {
    this.loaderService.isLoading.next(false);
    this.cdr.detectChanges();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createForm() {
    this.activityForm = this.fb.group({
      activityCode: [null, Validators.required],
      transactionCode: [null, Validators.required],
      activity: [null, Validators.required],
      submissionDate: [Moment(), null],
      plannedStartDate: [null],
      plannedEndDate: [null],
      // where: [null, Validators.required],
      output: [null],
      projectName: [null, Validators.required],
      resultArea: [null, Validators.required],
      objective: [null, Validators.required],
      submittedBy: [],
      implementor: [null, Validators.required],
      officerPosition: [null],
    });
    const submittedBy = this.currentUser['displayName'];
    this.data = {...this.data, submittedBy};

    this.activityForm.patchValue(this.data);
  }

  myFilter = (d): boolean => {
    const startDate = this.activityForm.get('plannedStartDate');
    if (d instanceof Moment) {
      d = d.format('YYYY-MM-DD');
    }
    if (startDate.value) {
      return d >= startDate.value;
    }
    return false;
  }

}

@Component({
  selector: 'app-issue-dialog',
  templateUrl: 'issue-dialog.html',
})
export class IssueDialogComponent implements OnInit, AfterViewInit {
  issueForm: FormGroup;
  areas = [];
  issueStatus = [];
  reports = [];
  users = [];

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService,
              private api: Dhis2Service,
              public dialogRef: MatDialogRef<IssueDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    this.api.getOptions('jefqZMCkKCZ').subscribe((options) => {
      this.areas = options['options'];
    });
    this.api.getOptions('qiInvioKxhh').subscribe((options) => {
      this.issueStatus = options['options'];
    });

    this.api.getAllUserDetails().subscribe(response => {
      this.users = response['users'];
    });
    if (this.data['report']) {
      this.reports = [{report: this.data['report']['event'], displayName: this.data['report']['dataValues']['reportTitle']}];
    }
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.loaderService.isLoading.next(false);
    this.cdr.detectChanges();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createForm() {
    this.issueForm = this.fb.group({
      registrationDate: [null, Validators.required],
      issue: [null, Validators.required],
      technicalArea: [null, Validators.required],
      transactionCode: [null, Validators.required],
      report: [null, Validators.required],
      trackedEntityInstance: [null],
      issueStatus: ['New'],
      responsiblePerson: [null],
      expectedResolutionDate: [null],
    });

    this.issueForm.patchValue(this.data);
  }

}

@Component({
  selector: 'app-action-dialog',
  templateUrl: 'action-dialog.html',
})
export class ActionDialogComponent implements OnInit, AfterViewInit {
  actionForm: FormGroup;
  status = [];
  outcomes = [];
  users = [];

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService,
              private api: Dhis2Service, public dialogRef: MatDialogRef<ActionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
  }

  public ngOnInit() {
    this.api.getOptions('GOUUD9RIdv6').subscribe((options) => {
      this.status = options['options'];
    });
    this.api.getOptions('qiInvioKxhh').subscribe((options) => {
      this.outcomes = options['options'];
    });

    this.api.getAllUserDetails().subscribe(response => {
      this.users = response['users'];
    });
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.loaderService.isLoading.next(false);
    this.cdr.detectChanges();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createForm() {
    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      currentIssueStatus: [null, Validators.required],
      event: [null],
      actionTakenBy: [null],
      actionDescription: [null],
      eventDate: [null],
      actionStartDate: [null],
      actionEndDate: [null],
    });

    this.actionForm.patchValue(this.data);
  }
}
