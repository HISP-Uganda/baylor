import {Dhis2Service} from '../core';
import {Injectable} from '@angular/core';
import * as mobx from 'mobx';
import {action, computed, observable} from 'mobx';
import * as _ from 'lodash';


mobx.configure({enforceActions: true});


@Injectable()
export class BaylorStore {
  @observable user;

  constructor(private dhis2Service: Dhis2Service) {
    let currentUser = null;
    this.dhis2Service.getUserDetails().subscribe(user => {
      currentUser = user;
    }, e => {
      console.log(e);
    }, action(() => {
      this.user = currentUser;
    }));
  }

  includes = (array, values) => {
    return _.filter(array, v => _.includes(values, v)).length > 0;
  };

  @computed get userDetails() {
    return this.user;
  }

  @computed get canSeeSettings() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser']);
    }
  }

  @computed get canApproveReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor']);
    }
  }

  @computed get canAddActivity() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor']);
    }
  }

  @computed get canAddReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canAddIssue() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canAddAction() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canEditActivity() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor']);
    }
  }

  @computed get canEditReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canEditIssue() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canEditAction() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canDeleteActivity() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor']);
    }
  }


  @computed get canDeleteReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canDeleteIssue() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canDeleteAction() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['System Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }
}
