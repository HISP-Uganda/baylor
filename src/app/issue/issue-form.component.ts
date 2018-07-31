import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import * as _ from 'lodash';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/internal/Observable';
import * as Moment from 'moment';

import {AppLoadingService, Dhis2Service, issueAttributes, keysToCamelCase} from '../core';

@Component({
  selector: 'app-issue',
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueFormComponent implements OnInit {

  issueForm: FormGroup;
  areas = [];
  issueStatus = [];
  reports = [];

  config = {
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 700
  };

  items = [];
  users: Observable<any[]>;
  orgUnits = [];
  levels = [];
  selectedLevel = {};

  maxDate = new Date();

  constructor(public loaderService: AppLoadingService,
              private api: Dhis2Service,
              private fb: FormBuilder,
              public router: Router,
              public snackBar: MatSnackBar) {
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
    this.api.getLevels().subscribe((response) => {
      this.levels = response['organisationUnitLevels'];
    }, error1 => console.log(error1), () => {
      this.selectedLevel = _.find(this.levels, {level: 5});
      this.getOrgUnits(this.selectedLevel);
    });
    this.createForm();
  }

  createForm() {
    this.issueForm = this.fb.group({
      registrationDate: [null, Validators.required],
      issue: [null, Validators.required],
      technicalArea: [null, Validators.required],
      trackedEntityInstance: [null],
      issueStatus: ['New'],
      where: [null, Validators.required],
      responsiblePerson: [null],
      expectedResolutionDate: [null],
    });
  }

  onFormSubmit() {
    if (this.issueForm.valid) {
      const result = this.issueForm.value;
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

      _.forOwn(issueAttributes, function (attribute, key) {
        if (result[key]) {
          attributes = [...attributes, {attribute, value: result[key]}];
        }
      });

      const trackedEntityInstances = result['where'].map(val => {
        const enrollments = [{
          orgUnit: val,
          program: 'bsg7cZMTqgI',
          enrollmentDate: date,
          incidentDate: date
        }];
        const n = 'I' + Moment().format('YYYYMMDD') +
          (Math.floor(Math.random() * 1000) + 1).toString().padStart(3, '0');
        const computedAttributes = [...attributes, {attribute: issueAttributes.transactionCode, value: n}];
        return {orgUnit: val, trackedEntityType: 'MCPQUTHX1Ze', attributes: computedAttributes, enrollments};
      });

      const instances = {trackedEntityInstances: trackedEntityInstances};
      this.api.postTrackedEntity(instances)
        .subscribe(hero => {
          this.snackBar.open('Issues created', 'OK', {
            duration: 2000,
          });
          this.router.navigate(['/issues']);

        }, error1 => {

        });
    } else {
      this.validateAllFormFields(this.issueForm);
    }
  }

  onSelectedChange(e) {
    const where = this.issueForm.get('where');
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
}
