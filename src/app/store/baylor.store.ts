import {activityAttributes, compare, Dhis2Service, getActivityStatus, mapOrgUnits, mapTrackedEntityInstances} from '../core';
import {Inject, Injectable} from '@angular/core';
import * as mobx from 'mobx';
import {action, computed, observable} from 'mobx';
import * as _ from 'lodash';
import {MatTableDataSource, Sort} from '@angular/material';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';

import {environment} from '../../environments/environment';


mobx.configure({enforceActions: true});

const API_URL = environment.apiUrl + '/events/files?';

@Injectable()
export class BaylorStore {
  @observable user = null;

  @observable activities = [];
  @observable issues = [];
  @observable actions = [];

  @observable currentActivity;
  @observable currentIssue;
  @observable currentAction;

  @observable loading;

  @observable pageInfo = {previousPageIndex: null, pageIndex: 0, pageSize: 15};

  @observable total;

  @observable sort = null;

  @observable filter = '';

  @observable activityUnits;

  constructor(private dhis2Service: Dhis2Service, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    this.dhis2Service.getUserDetails().subscribe(action(user => {
      this.user = user;
      this.storage.set('user', user);
    }), e => {
      console.log(e);
    });
  }

  /*
  * actions
  * */

  @action fetchActivities = () => {
    this.dhis2Service
      .getTrackedEntities('MLb410Oz6cU', this.pageInfo.pageSize, this.pageInfo.pageIndex + 1, this.activityForUser)
      .subscribe(action(response => {
        const {trackedEntityInstances, pager} = response;
        const orgUnits = _.uniq(trackedEntityInstances.map(o => o.orgUnit)).join(',');
        this.fetchUnits(orgUnits);
        this.total = pager.total;
        this.activities = trackedEntityInstances;

      }), e => console.log(e));
  };

  @action fetchUnits = ids => {
    this.dhis2Service
      .getOrgUnits(ids)
      .subscribe(action(orgUnits => {
        this.activityUnits = mapOrgUnits(orgUnits);
      }), e => console.log(e));
  };

  @action setFilter = (filterValue: string) => {
    this.filter = filterValue;
  };

  @action pager = (event) => {
    this.pageInfo = event;
    this.fetchActivities();
  };

  @action sortActivities = (sort: Sort) => {
    this.sort = sort;
  };

  @action changeActivities = (result) => {
    const index = this.activities.findIndex(item => item.trackedEntityInstance === result.trackedEntityInstance);

    let activity = this.activities[index];
    let attributes = activity['attributes'];
    _.forOwn(activityAttributes, function (attribute, key) {
      if (result[key]) {
        attributes = [...attributes, {attribute, value: result[key]}];
      }
    });

    activity = {...activity, attributes};

    this.activities = [
      ...this.activities.slice(0, index),
      activity,
      ...this.activities.slice(index + 1)
    ];
  };

  includes = (array, values) => {
    return _.filter(array, v => _.includes(values, v)).length > 0;
  };

  @computed get processedActivities() {
    let data = mapTrackedEntityInstances(this.activities, activityAttributes);
    data = data.map(r => {
      return {
        ...r,
        orgUnitName: this.activityUnits ? this.activityUnits[r.orgUnit] : '',
        download: r.report && r.report.event && r.report.report ? API_URL + 'eventUid=' +
          r.report.event + '&dataElementUid=yxGmEyvPfwl' : null,
        ...getActivityStatus(r)
      };
    });
    if (this.sort !== null) {
      if (!this.sort.active || this.sort.direction === '') {
        return data;
      }

      data = data.sort((a, b) => {
        const isAsc = this.sort.direction === 'asc';
        switch (this.sort.active) {
          case 'activity':
          case 'activityCode':
            return compare(a.activityCode, b.activityCode, isAsc);
          default:
            return 0;
        }
      });
    }

    const dataSource = new MatTableDataSource<any>(data);
    let filterValue = this.filter.trim();
    filterValue = filterValue.toLowerCase();
    dataSource.filter = filterValue;
    return dataSource;
  }

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

  @computed get activityForUser() {
    const user = this.storage.get('user');
    if (user) {
      const roles = _.map(user.userCredentials.userRoles, 'name');
      if (this.includes(roles, ['System Administrator', 'Superuser'])) {
        return null;
      } else {
        return {attribute: activityAttributes['implementor'], value: user.displayName};
      }
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
