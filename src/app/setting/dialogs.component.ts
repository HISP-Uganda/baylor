import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {AppLoadingService, Dhis2Service} from '../core';

@Component({
  selector: 'app-setting-project-dialog',
  templateUrl: './project-setting/project-dialog.html',
})
export class ProjectDialogComponent implements OnInit, AfterViewInit {
  projectForm: FormGroup;
  viewing = false;

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService, private api: Dhis2Service,
              public dialogRef: MatDialogRef<ProjectDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    const {viewing} = this.data;
    this.viewing = viewing;
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
    this.projectForm = this.fb.group({
      projectCode: [null, Validators.required],
      projectName: [null, Validators.required],
      projectYear: [new Date().getFullYear(), Validators.required]
    });

    this.projectForm.patchValue(this.data);
  }
}


@Component({
  selector: 'app-setting-objective-dialog',
  templateUrl: './objective-setting/objective-dialog.html',
})
export class ObjectiveDialogComponent implements OnInit, AfterViewInit {
  objectiveForm: FormGroup;
  projects = [];
  viewing = false;

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService, private api: Dhis2Service,
              public dialogRef: MatDialogRef<ObjectiveDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    const {viewing} = this.data;
    this.viewing = viewing;
    this.api
      .getFromDataStore('baylor', 'projects')
      .subscribe(
        (projects) => {
          this.projects = projects;
        }, error1 => console.log(error1), () => {
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
    this.objectiveForm = this.fb.group({
      objectiveCode: [null, Validators.required],
      objectiveName: [null, Validators.required],
      project: [null, Validators.required]
    });

    this.objectiveForm.patchValue(this.data);
  }
}


@Component({
  selector: 'app-setting-result-area-dialog',
  templateUrl: './result-area-setting/result-area-dialog.html',
})
export class ResultAreaDialogComponent implements OnInit, AfterViewInit {
  resultAreaForm: FormGroup;
  objectives = [];
  viewing = false;

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService, private api: Dhis2Service,
              public dialogRef: MatDialogRef<ResultAreaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    const {viewing} = this.data;
    this.viewing = viewing;
    this.api
      .getFromDataStore('baylor', 'objectives')
      .subscribe(
        (objectives) => {
          this.objectives = objectives;
        }, error1 => console.log(error1), () => {
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

    this.resultAreaForm = this.fb.group({
      resultAreaCode: [null, Validators.required],
      resultAreaName: [null, Validators.required],
      objective: [null, Validators.required]
    });

    this.resultAreaForm.patchValue(this.data);
  }
}

@Component({
  selector: 'app-setting-activity-dialog',
  templateUrl: './activity-setting/activity-dialog.html',
})
export class ActivityDialogComponent implements OnInit, AfterViewInit {
  activityForm: FormGroup;
  resultAreas = [];
  viewing = false;
  users = [];

  frequencies = ['Monthly', 'Quarterly', 'Yearly'];

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService, private api: Dhis2Service,
              public dialogRef: MatDialogRef<ActivityDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    const {viewing} = this.data;
    this.viewing = viewing;

    this.api.getAllUserDetails().subscribe(response => {
      this.users = response['users'];
    });
    this.api
      .getFromDataStore('baylor', 'resultAreas')
      .subscribe(
        (resultAreas) => {
          this.resultAreas = resultAreas;
        }, error1 => console.log(error1), () => {
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
    this.activityForm = this.fb.group({
      activityCode: [null, Validators.required],
      activityName: [null, Validators.required],
      resultArea: [null, Validators.required],
      frequency: [null, Validators.required],
      expectedOutput: [null, Validators.required],
      responsiblePerson: null,
      financialYear: [null, Validators.required]
    });

    this.activityForm.patchValue(this.data);
  }
}


@Component({
  selector: 'app-setting-output-dialog',
  templateUrl: './output-setting/output-dialog.html',
})
export class OutputDialogComponent implements OnInit, AfterViewInit {
  outputForm: FormGroup;
  frequency = ['Monthly', 'Quarterly', 'Yearly'];
  projects = [];
  viewing = false;

  constructor(private cdr: ChangeDetectorRef, public loaderService: AppLoadingService, private api: Dhis2Service,
              public dialogRef: MatDialogRef<OutputDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
  }

  public ngOnInit() {
    const {viewing} = this.data;
    this.viewing = viewing;
    this.api
      .getFromDataStore('baylor', 'projects')
      .subscribe(
        (projects) => {
          this.projects = projects;
        }, error1 => console.log(error1), () => {
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
    this.outputForm = this.fb.group({
      description: [null, Validators.required],
      output: [null, Validators.required],
      period: [null, Validators.required],
      project: [null, Validators.required]
    });
    this.outputForm.patchValue(this.data);
  }
}
