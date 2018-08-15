import * as _ from 'lodash';
import {TreeviewItem} from 'ngx-treeview';
import * as Moment from 'moment';


export function keysToCamelCase(object) {
  const camelCaseObject = _.cloneDeep(object);
  return new TreeviewItem({
    value: camelCaseObject['id'] + ',' + camelCaseObject['displayName'],
    text: camelCaseObject['displayName'],
    collapsed: true,
    checked: false,
    children: _.map(camelCaseObject['children'], keysToCamelCase)
  });
}

export function mapEvents(data, dataElements) {
  dataElements = _.invert(dataElements);
  return data.map(r => {
    return {
      ...r,
      ..._.fromPairs(_.map(r.dataValues, i => [dataElements[i['dataElement']], i.value]))
    };
  });
}


export function mapEvents2(data, dataElements) {
  dataElements = _.invert(dataElements);
  return data.map(r => {
    return {
      ...r,
      dataValues: _.fromPairs(_.map(r.dataValues, i => [dataElements[i['dataElement']], i.value])),
      ..._.fromPairs(_.map(r.dataValues, i => [dataElements[i['dataElement']], i.value]))
    };
  });
}

export function mapTrackedEntityInstances(data, attributes) {
  attributes = _.invert(attributes);
  return data.map(r => {
    return {
      ...r,
      registrationDate: r['enrollments'] ? Moment(r['enrollments'][0]['enrollmentDate']).format('YYYY-MM-DD') : null,
      ..._.fromPairs(_.map(r.attributes, i => [attributes[i.attribute], i.value])),
    };
  });
}

export function mapTrackedEntityInstance(data, attributes) {
  attributes = _.invert(attributes);
  return {
    ...data,
    registrationDate: data['enrollments'] ? Moment(data['enrollments'][0]['enrollmentDate']).format('YYYY-MM-DD') : null,
    ..._.fromPairs(_.map(data['attributes'], i => [attributes[i.attribute], i.value])),
  };
}

export function mapTrackedEntityInstance2(data, attributes) {
  attributes = _.invert(attributes);
  return {
    ..._.fromPairs(_.map(data['attributes'], i => [attributes[i.attribute], i.value])),
  };
}


export function mapEvent(data) {
  return {
    ...data,
    dataValues: _.fromPairs(_.map(data['dataValues'], i => [i['dataElement'], i.value]))
  };
}

export function mapEvent2(data, dataElements) {
  dataElements = _.invert(dataElements);
  return {
      ...data,
    ..._.fromPairs(_.map(data['dataValues'], i => [dataElements[i['dataElement']], i.value]))
  };
}

export function mapOrgUnits(data) {
  return _.fromPairs(_.map(data['organisationUnits'], i => [i.id, i.displayName]));
}

export function getOrgUnitTree(data) {
  return keysToCamelCase(data);

}

export function applyFilter(filterValue: string) {
  filterValue = filterValue.trim();
  filterValue = filterValue.toLowerCase();
  return filterValue;
}

export function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function getActivityStatus(o) {
  let events = o['enrollments'][0]['events'];
  events = _.filter(events, e => {
    return e.reportStartDate !== null;
  });
  const date = Moment();
  if (events.length > 0) {
    return {oldActivityStatus: 'complete', report: events[0]};
  } else {
    const d = Moment(o.plannedStartDate);
    if (d >= date) {
      if (d.diff(date, 'days') <= 7) {
        return {oldActivityStatus: 'Upcoming'};
      } else {
        return {oldActivityStatus: 'On schedule'};
      }
    } else {
      return {oldActivityStatus: 'Overdue'};
    }
  }
}
