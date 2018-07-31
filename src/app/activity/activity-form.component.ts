import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/internal/Observable';
import {activityAttributes, AppLoadingService, Dhis2Service, keysToCamelCase} from '../core';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityFormComponent implements OnInit {
  activityForm: FormGroup;

  config = {
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 700
  };

  items = [];
  positions: Observable<any[]>;
  users: Observable<any[]>;
  orgUnits = [];
  levels = [];
  currentUser = {};
  selectedLevel = {};
  activities = [];
  projects = [];
  resultAreas = [];
  objectives = [];

  maxDate = new Date();

  constructor(public loaderService: AppLoadingService,
              private api: Dhis2Service,
              private fb: FormBuilder,
              public router: Router,
              public snackBar: MatSnackBar) {
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

    this.api.getLevels().subscribe((response) => {
      this.levels = response['organisationUnitLevels'];
    }, error1 => console.log(error1), () => {
      this.selectedLevel = _.find(this.levels, {level: 5});
      this.getOrgUnits(this.selectedLevel);
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
      const {objective} = resultArea;
      const {project} = objective;
      // const { objective } = _.find(this.resultAreas, { resultAreaCode: resultArea.resultAreaCode });
      // const { project } = _.find(this.objectives, { objectiveCode: objective.objectiveCode });
      this.activityForm.controls['resultArea'].patchValue(resultArea.resultAreaCode + ' - ' + resultArea.resultAreaName);
      this.activityForm.controls['objective'].patchValue(objective.objectiveCode + ' - ' + objective.objectiveName);
      this.activityForm.controls['activity'].patchValue(activityCode + ' - ' + activityName);
      this.activityForm.controls['projectName'].patchValue(project.projectCode + ' - ' + project.projectName);
    });
  }

  createForm() {
    const n = 'A' + Moment().format('YYYYMMDD') +
      (Math.floor(Math.random() * 1000) + 1).toString().padStart(3, '0');
    const data = {
      submittedBy: this.currentUser['displayName'],
      transactionCode: n,
      submissionDate: Moment()
    };
    this.activityForm = this.fb.group({
      activityCode: [null, Validators.required],
      transactionCode: [null, Validators.required],
      activity: [null, Validators.required],
      submissionDate: [null, Validators.required],
      plannedStartDate: [null],
      plannedEndDate: [null],
      where: [null, Validators.required],
      output: [null],
      projectName: [null, Validators.required],
      resultArea: [null, Validators.required],
      objective: [null, Validators.required],
      submittedBy: [null],
      implementor: [null, Validators.required],
      officerPosition: [null],
    });
    this.activityForm.patchValue(data);
  }


  processErrors(response) {
    let errors = [];
    let conflicts = [];
    let successes = [];
    if (response['status'] === 500) {
      errors = [...errors, {...response['error']}];
    } else if (response['status'] === 409) {
      _.forEach(response['error']['response']['importSummaries'], (s) => {
        _.forEach(s['conflicts'], (conflict) => {
          conflicts = [...conflicts, {...conflict}];
        });
        if (s['href']) {
          successes = [...successes, {href: s['href']}];
        }
      });
    } else if (response['httpStatusCode'] === 200) {
      _.forEach(response['response']['importSummaries'], (s) => {
        successes = [...successes, {href: s['href']}];
      });
    }
    return {errors, conflicts, successes};
  }

  onFormSubmit() {

    if (this.activityForm.valid) {
      const form = this.activityForm.value;
      let attributes = [];
      form['plannedStartDate'] = Moment(form['plannedStartDate']).format('YYYY-MM-DD');
      form['plannedEndDate'] = Moment(form['plannedEndDate']).format('YYYY-MM-DD');
      form['submissionDate'] = Moment(form['submissionDate']).format('YYYY-MM-DD');
      const date = Moment().format('YYYY-MM-DD');
      _.forOwn(activityAttributes, function (attribute, key) {
        if (form[key]) {
          attributes = [...attributes, {attribute, value: form[key]}];
        }
      });

      const trackedEntityInstances = form['where'].map(val => {
        const enrollments = [{
          orgUnit: val,
          program: 'MLb410Oz6cU',
          enrollmentDate: form['submissionDate'],
          incidentDate: form['submissionDate']
        }];
        return {orgUnit: val, trackedEntityType: 'MCPQUTHX1Ze', attributes, enrollments};
      });

      const instances = {trackedEntityInstances: trackedEntityInstances};
      this.api.postTrackedEntity(instances)
        .subscribe(hero => {
          this.snackBar.open('Activities created', 'OK', {
            duration: 2000,
          });
          this.router.navigate(['/activities']);

        }, error1 => {

        });
    } else {
      this.validateAllFormFields(this.activityForm);
    }
  }

  onSelectedChange(e) {
    const where = this.activityForm.get('where');
    const final = e.map(val => {
      const v = val.split(',');
      return {displayName: v[1], value: v[0]};
    });

    this.orgUnits = final;

    where.setValue([...final.map(v => {
        return v.value;
      })]
    );
  }

  onFilterChange(e) {
  }

  getOrgUnits(l) {
    let level;
    let org;
    const level1 = 'id,displayName';
    const level2 = 'id,displayName,children[id,displayName]';
    const level3 = 'id,displayName,children[id,displayName,children[id,displayName]]';
    const level4 = 'id,displayName,children[id,displayName,children[id,displayName,children[id,displayName]]]';
    const level5 = 'id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,children[id,displayName]]]]';
    const level6 = 'id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,' +
      'children[id,displayName]]]]]';
    const level7 = 'id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,' +
      'children[id,displayName,children[id,displayName]]]]]]';
    const level8 = 'id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,children[id,displayName,' +
      'children[id,displayName,children[id,displayName,children[id,displayName]]]]]]]';
    switch (l.level) {
      case 1:
        level = level1;
        break;
      case 2:
        level = level2;
        break;
      case 3:
        level = level3;
        break;
      case 4:
        level = level4;
        break;
      case 5:
        level = level5;
        break;
      case 6:
        level = level6;
        break;
      case 7:
        level = level7;
        break;
      case 8:
        level = level8;
        break;
      default:
        break;
    }

    this.api
      .getOrgUnitChildren('HrlmR2Iolvn', level)
      .subscribe(
        (units) => {
          org = units;
        }, e => console.log(e), () => {
          this.items = [keysToCamelCase(org)];
        });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  myFilter = (d): boolean => {
    const startDate = this.activityForm.get('plannedStartDate');
    if (startDate.value) {
      return d >= startDate.value;
    }
    return false;
  };
}
