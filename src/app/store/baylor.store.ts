import {
  actionDataElements,
  activityAttributes,
  compare,
  Dhis2Service,
  issueAttributes,
  mapEvent2,
  mapEvents,
  mapOrgUnits,
  mapTrackedEntityInstance,
  mapTrackedEntityInstance2,
  mapTrackedEntityInstances,
  reportDataElements
} from '../core';
import {Inject, Injectable} from '@angular/core';
import * as mobx from 'mobx';
import {action, computed, observable} from 'mobx';
import * as _ from 'lodash';
import {MatTableDataSource, Sort} from '@angular/material';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import * as Moment from 'moment';

import {environment} from '../../environments/environment';
import {HttpEventType} from '@angular/common/http';


mobx.configure({enforceActions: true});

const API_URL = environment.apiUrl + '/events/files?';

@Injectable()
export class BaylorStore {
  @observable user = null;

  @observable activities = [];
  @observable issues = [];
  @observable actions = [];

  @observable activityId;
  @observable issueId;
  @observable currentIssue;
  @observable currentAction;
  @observable currentActivity;

  @observable formLabel = 'Save';

  @observable issueActions = [];

  @observable loading;

  @observable pageInfo = {previousPageIndex: null, pageIndex: 0, pageSize: 5};

  @observable total;
  @observable totalReports;

  @observable sort = null;
  @observable reportSort = null;

  @observable filter = '';
  @observable reportFilter = '';

  @observable activityUnits;

  @observable backing = false;

  @observable activitySearches = [];
  @observable issueSearches = [];

  @observable reportUploadId = null;
  @observable percentageUpload = 0;

  constructor(
    private dhis2Service: Dhis2Service,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
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

  @action setFormLabel = label => {
    this.formLabel = label;
  };

  @action fetchActivities = () => {
    if (!this.backing) {
      this.dhis2Service
        .getTrackedEntities('MLb410Oz6cU', this.pageInfo.pageSize, this.pageInfo.pageIndex + 1, this.computedActivitySearches)
        .subscribe(action(response => {
          const trackedEntityInstances = response['trackedEntityInstances'];
          const pager = response['pager'];
          const orgUnits = _.uniq(trackedEntityInstances.map(o => o.orgUnit)).join(',');
          this.fetchUnits(orgUnits);
          this.total = pager.total;
          this.activities = trackedEntityInstances;

          if (this.activityReportIds) {
            this.getReportIssues(this.activityReportIds);
          }
          this.storage.set('activities', trackedEntityInstances);
        }), e => console.log(e));
    } else {
      this.backing = false;
    }
  };

  @action fetchIssues = () => {
    this.dhis2Service
      .getTrackedEntities('bsg7cZMTqgI', this.pageInfo.pageSize, this.pageInfo.pageIndex + 1, this.computedIssueSearches)
      .subscribe(action(response => {
        const trackedEntityInstances = response['trackedEntityInstances'];
        const pager = response['pager'];
        const orgUnits = _.uniq(trackedEntityInstances.map(o => o.orgUnit)).join(',');
        this.fetchUnits(orgUnits);
        this.total = pager.total;
        this.issues = trackedEntityInstances;
      }), e => console.log(e));
  };

  @action onFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);
      this.dhis2Service.upload(formData).subscribe(action(e => {
        if (e['type'] === HttpEventType.UploadProgress) {
          this.percentageUpload = Math.round(100 * e['loaded'] / e['total']);
        } else {
          this.reportUploadId = e['body']['response']['fileResource']['id'];
        }
      }), e => {
        console.log(e);
      });
    }
  };

  @action fetchUnits = ids => {
    this.dhis2Service
      .getOrgUnits(ids)
      .subscribe(action(orgUnits => {
        this.activityUnits = mapOrgUnits(orgUnits);
      }), e => console.log(e));
  };

  @action setActivityId = activityId => {
    this.activityId = activityId;
  };

  @action setFilter = (filterValue) => {
    this.filter = filterValue;
  };

  @action pager = (event) => {
    this.pageInfo = event;
    this.fetchActivities();
  };

  @action issuePager = (event) => {
    this.pageInfo = event;
    this.fetchIssues();
  };

  @action setPageInfo = pageInfo => {
    this.pageInfo = pageInfo;
  };

  @action sortActivities = (sort: Sort) => {
    this.sort = sort;
  };

  @action changeActivities = (result) => {
    const index = this.activities.findIndex(item => item.trackedEntityInstance === result.trackedEntityInstance);

    let activity = this.activities[index];

    let attributes = [];
    _.forOwn(activityAttributes, function (attribute, key) {
      if (result[key]) {
        attributes = [...attributes, {attribute, value: result[key]}];
      }
    });

    activity = {...activity, attributes, enrollments: result['enrollments']};

    this.dhis2Service.postTrackedEntity(activity).subscribe(action(response => {
      this.activities = [
        ...this.activities.slice(0, index),
        activity,
        ...this.activities.slice(index + 1)
      ];
    }), e => {
      console.log(e);
    });
  };

  @action changeActivityStatus = (trackedEntityInstance, activityStatus) => {
    this.setCurrentActivity(trackedEntityInstance);
    const result = {...this.activityFormData, activityStatus};
    this.changeActivities(result);
  };

  @action getReportIssues = reportId => {
    this.dhis2Service.issues(reportId).subscribe(action(response => {
      this.issues = response['trackedEntityInstances'];
    }), e => console.log(e));
  };

  @action setCurrentIssue = issueId => {
    this.currentIssue = _.find(this.issues, {trackedEntityInstance: issueId});
  };

  /*@action setCurrentIssue2 = issueId => {
    this.currentIssue = _.find(this.issues, {trackedEntityInstance: issueId});
  };*/

  @action setCurrentActivity = activityId => {
    this.currentActivity = _.find(this.activities, {trackedEntityInstance: activityId});
  };

  @action addIssue = (issue) => {
    this.dhis2Service.postTrackedEntity(issue).subscribe(action(response => {
      const index = this.issues.findIndex(item => item.trackedEntityInstance === issue.trackedEntityInstance);
      if (index !== -1) {
        this.issues = [
          ...this.issues.slice(0, index),
          issue,
          ...this.issues.slice(index + 1)
        ];
      } else {
        this.issues = [...this.issues, issue];
      }

    }), error => {
      console.log(error);
    });
  };

  @action addAction = (i, a) => {
    const issueIndex = this.issues.findIndex(item => item.trackedEntityInstance === i);

    let issue = this.issues[issueIndex];
    let dataValues = [];
    _.forOwn(actionDataElements, function (dataElement, key) {
      if (a[key]) {
        dataValues = [...dataValues, {dataElement, value: a[key]}];
      }
    });

    let attributes = issue.attributes;

    const index = attributes.findIndex(item => item.attribute === issueAttributes.issueStatus);

    const issueStatus = attributes[index];

    attributes = [
      ...attributes.slice(0, index),
      {...issueStatus, value: a['currentIssueStatus']},
      ...attributes.slice(index + 1)
    ];


    let enrollment = issue.enrollments[0];

    let events = enrollment['events'] || [];

    const event = {
      trackedEntityInstance: i,
      program: 'bsg7cZMTqgI',
      orgUnit: issue['orgUnit'],
      programStage: 'KO6z9FXmPLv',
      eventDate: a['eventDate'] || Moment().format('YYYY-MM-DD'),
      dataValues
    };
    events = [...events, event];

    enrollment = {...enrollment, events};

    issue = {...issue, attributes, enrollments: [enrollment]};

    this.dhis2Service.postTrackedEntity(issue).subscribe(action(response => {
      this.issues = [
        ...this.issues.slice(0, issueIndex),
        issue,
        ...this.issues.slice(issueIndex + 1)
      ];

      this.setCurrentIssue(i);
    }), error => {
      console.log(error);
    });
  };

  @action addReport = (report) => {
    const enrollment = this.currentActivity['enrollments'][0];
    enrollment['events'] = [report];
    let activity = mapTrackedEntityInstance(this.currentActivity, activityAttributes);
    activity = {...activity, activityStatus: 'Report Submitted'};
    this.dhis2Service.postEvent(report).subscribe(action(e => {
      activity = {...activity, enrollments: [enrollment]};
      this.changeActivities(activity);
    }), e => {
      console.log(e);
    });
  };

  @action approveReport = (report, reportStatus) => {
    const enrollment = this.currentActivity['enrollments'][0];
    enrollment['events'] = [report];
    let activity = mapTrackedEntityInstance(this.currentActivity, activityAttributes);

    if (_.has(reportStatus, 'reportStatus') && reportStatus['reportedStatus'] === 'Report Approved') {
      activity = {...activity, activityStatus: 'Report Approved'};
    }
    this.dhis2Service.postEvent(report).subscribe(action(e => {
      activity = {...activity, enrollments: [enrollment]};
      this.changeActivities(activity);
    }), e => {
      console.log(e);
    });
  };

  @action setBacking = back => {
    this.backing = back;
  };

  @action setActivitySearches = activitySearches => {
    this.activitySearches = activitySearches;
  };
  @action setIssueSearches = issueSearches => {
    this.issueSearches = issueSearches;
  };


  @action setIssueId = issueId => {
    this.issueId = issueId;
  };
  includes = (array, values) => {
    return _.filter(array, v => _.includes(values, v)).length > 0;
  };

  @computed get computedActivitySearches() {
    if (this.activityForUser) {
      return [...this.activitySearches, this.activityForUser];
    }
    return this.activitySearches;
  }

  @computed get computedIssueSearches() {
    if (this.issuesForUser) {
      return [...this.issueSearches, this.issuesForUser];
    }
    return this.issueSearches;
  }

  @computed get currentLabel() {
    return this.formLabel;
  }

  @computed get processedActivities() {
    let data = this.activities.map(r => {
      const a = mapTrackedEntityInstance(r, activityAttributes);
      let report = null;
      let reportStatus = '';
      const today = Moment();
      let canImplement = false;
      const plannedStartDate = Moment(a.plannedStartDate);
      let activityStatus = a['activityStatus'];
      let cls = activityStatus;

      if (r['enrollments'].length > 0 && r['enrollments'][0]['events'] && r['enrollments'][0]['events'].length > 0) {
        const dataValues = r['enrollments'][0]['events'][0]['dataValues'] || [];
        report = _.find(dataValues, {dataElement: reportDataElements.report});
        const status = _.find(dataValues, {dataElement: reportDataElements.reportStatus});

        if (status) {
          reportStatus = status['value'];
        }

        if (!activityStatus) {
          activityStatus = 'Report Submitted';
          cls = 'ReportSubmitted';
        }
      }

      if (activityStatus === 'Report Submitted') {
        cls = 'ReportSubmitted';
      }

      if (activityStatus === 'Report Approved') {
        cls = 'ReportApproved';
      }

      if (activityStatus === 'Overdue' || activityStatus === 'Upcoming' || activityStatus === 'On Schedule' || !activityStatus) {
        canImplement = true;
      }

      if (!activityStatus && plannedStartDate > today && plannedStartDate.diff(today, 'days') <= 7) {
        activityStatus = 'Upcoming';
        cls = 'Upcoming';
      } else if (!activityStatus && today > plannedStartDate) {
        activityStatus = 'Overdue';
        cls = 'Overdue';
      } else if (!activityStatus && plannedStartDate > today && plannedStartDate.diff(today, 'days') > 7) {
        activityStatus = 'On Schedule';
        cls = 'OnSchedule';
      } else if (activityStatus === 'On Schedule' && plannedStartDate > today && plannedStartDate.diff(today, 'days') <= 7) {
        activityStatus = 'Upcoming';
        cls = 'Upcoming';
      } else if (activityStatus === 'On Schedule' && plannedStartDate > today && plannedStartDate.diff(today, 'days') > 7) {
        activityStatus = 'On Schedule';
        cls = 'OnSchedule';
      } else if (activityStatus === 'On Schedule' && today > plannedStartDate) {
        activityStatus = 'Overdue';
        cls = 'Overdue';
      } else if (activityStatus === 'Upcoming' && today > plannedStartDate) {
        activityStatus = 'Overdue';
        cls = 'Overdue';
      }

      return {
        ...a,
        orgUnitName: this.activityUnits ? this.activityUnits[r.orgUnit] : '',
        download: report ? API_URL + 'eventUid=' + r['enrollments'][0]['events'][0]['event'] + '&dataElementUid=yxGmEyvPfwl' : null,
        reportStatus,
        activityStatus,
        canImplement,
        cls
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
    dataSource.filter = this.filter.toLowerCase().trim();
    return dataSource;
  }

  @computed get processedActivity() {
    const a = mapTrackedEntityInstance2(this.currentActivity, activityAttributes);
    let dataValues = [];
    if (this.currentActivity &&
      this.currentActivity['enrollments'] &&
      this.currentActivity['enrollments'][0]['events'] &&
      this.currentActivity['enrollments'][0]['events']) {
      const events = this.currentActivity['enrollments'][0]['events'];
      if (events.length > 0) {
        dataValues = events[0];
      }
    }
    const report = _.find(dataValues, {dataElement: reportDataElements.report});
    return {
      ...a,
      download: report ? API_URL + 'eventUid=' + report['value'] + '&dataElementUid=yxGmEyvPfwl' : null,
    };
  }

  @computed get userDetails() {
    return this.user;
  }

  @computed get processedReportIssues() {
    let report = '';

    if (this.currentActivity['enrollments'].length > 0 &&
      this.currentActivity['enrollments'][0]['events'] &&
      this.currentActivity['enrollments'][0]['events'].length > 0) {
      report = this.currentActivity['enrollments'][0]['events'][0]['event'];
    }
    const issues = _.filter(this.issues, (issue) => {
      return _.find(issue.attributes, {attribute: issueAttributes.report, value: report});
    });
    const data = issues.map(r => {
      const a = mapTrackedEntityInstance(r, issueAttributes);
      return {
        ...a,
        orgUnitName: this.activityUnits ? this.activityUnits[r['orgUnit']] : '',
      };
    });
    return new MatTableDataSource<any>(data);
  }

  @computed get processedIssues() {
    const data = this.issues.map(r => {
      const a = mapTrackedEntityInstance(r, issueAttributes);
      return {
        ...a,
        orgUnitName: this.activityUnits ? this.activityUnits[r.orgUnit] : '',
      };
    });
    return new MatTableDataSource<any>(data);
  }

  @computed get reportFormData() {
    if (this.currentActivity &&
      this.currentActivity['enrollments'].length > 0 &&
      this.currentActivity['enrollments'][0]['events'].length > 0) {
      return mapEvent2(this.currentActivity['enrollments'][0]['events'][0], reportDataElements);
    }
    return {};
  }

  @computed get activityFormData() {
    return mapTrackedEntityInstance(this.currentActivity, activityAttributes);
  }

  @computed get processedIssueActions() {
    if (this.currentIssue &&
      this.currentIssue['enrollments'] &&
      this.currentIssue['enrollments'][0]['events']) {
      const issue = mapTrackedEntityInstance(this.currentIssue, issueAttributes);
      const actions = mapEvents(this.currentIssue['enrollments'][0]['events'], actionDataElements);
      const processedActions = actions.map(a => {
        return {...a, ...issue};
      });
      return new MatTableDataSource<any>(processedActions);
    }
  }

  @computed get processedActions() {
    let actions = [];
    this.issues.forEach(i => {
      const ev = mapTrackedEntityInstance(i, issueAttributes);
      i['enrollments'].forEach(e => {
        let currentActions = mapEvents(e['events'], actionDataElements);
        currentActions = currentActions.map(a => {
          return {
            ...a,
            ...ev
          };
        });
        actions = [...actions, ...currentActions];
      });
    });
    return new MatTableDataSource<any>(actions);
  }

  @computed get activityReportIds() {
    let ids = [];
    this.activities.forEach(a => {
      if (a['enrollments'].length > 0 && a['enrollments'][0]['events'] && a['enrollments'][0]['events'].length > 0) {
        ids = [...ids, a['enrollments'][0]['events'][0]['event']];
      }
    });
    return ids.join(';');
  }

  @computed get activityReportId() {
    let ids = [];
    this.activities.forEach(a => {
      if (a['enrollments'].length > 0 && a['enrollments'][0]['events'] && a['enrollments'][0]['events'].length > 0) {
        ids = [...ids, a['enrollments'][0]['events'][0]['event']];
      }
    });
    return ids.join(';');
  }

  @computed get processedReports() {
    const events = this.activities.map(a => {
      if (a['enrollments'].length > 0 &&
        a['enrollments'][0]['events'] &&
        a['enrollments'][0]['events'].length > 0) {
        return {
          ...a['enrollments'][0]['events'][0], ...mapTrackedEntityInstance(a, activityAttributes),
          orgUnitName: this.activityUnits ? this.activityUnits[a.orgUnit] : ''
        };
      }
      return {
        ...mapTrackedEntityInstance(a, activityAttributes),
        orgUnitName: this.activityUnits ? this.activityUnits[a.orgUnit] : '',
      };
    });
    let issues = mapTrackedEntityInstances(this.issues, issueAttributes);
    issues = _.groupBy(issues, 'report');

    let data = mapEvents(events, reportDataElements);
    data = data.map(e => {
      let cls = '';

      if (e['reportStatus'] === 'Pending Approval') {
        cls = 'pending';
      } else {
        cls = e['reportStatus'];
      }

      return {
        ...e,
        cls,
        download: e.report ? API_URL + 'eventUid=' + e.event + '&dataElementUid=yxGmEyvPfwl' : null,
        issues: issues[e.event] ? issues[e.event].length : 0
      };
    });
    return new MatTableDataSource<any>(data);
  }

  @computed get canSeeSettings() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser']);
    }
  }

  @computed get canApproveReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor']);
    }
  }

  @computed get activityForUser() {
    const user = this.storage.get('user');
    if (user) {
      const roles = _.map(user.userCredentials.userRoles, 'name');
      if (this.includes(roles, ['Systems Administrator', 'Superuser'])) {
        return null;
      } else {
        return {attribute: activityAttributes['implementor'], value: user.displayName, operator: 'EQ'};
      }
    }
  }

  @computed get issuesForUser() {
    const user = this.storage.get('user');
    if (user) {
      const roles = _.map(user.userCredentials.userRoles, 'name');
      if (this.includes(roles, ['Systems Administrator', 'Superuser'])) {
        return null;
      } else {
        return {
          attribute: issueAttributes['responsiblePerson'],
          value: user.displayName,
          operator: 'EQ'
        };
      }
    }
  }

  @computed get canAddActivity() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor']);
    }
  }

  @computed get canAddReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canAddIssue() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canAddAction() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canEditActivity() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor']);
    }
  }

  @computed get canEditReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canEditIssue() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canEditAction() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canDeleteActivity() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor']);
    }
  }


  @computed get canDeleteReport() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canDeleteIssue() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }

  @computed get canDeleteAction() {
    if (this.userDetails) {
      const roles = _.map(this.userDetails.userCredentials.userRoles, 'name');
      return this.includes(roles, ['Systems Administrator', 'Superuser', 'Activity supervisor', 'EndUser1']);
    }
  }
}
