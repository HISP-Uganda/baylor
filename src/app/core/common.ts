import * as _ from 'lodash';
import {TreeviewItem} from 'ngx-treeview';

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


export function mapProgramTrackedEntityAttributes(data) {
  const attributes = data['programTrackedEntityAttributes'];
  return _.fromPairs(_.map(attributes, i => [i.id, i.displayName]));
}

export function mapEvents(data, dataElements) {
  dataElements = _.invert(dataElements);
  const events = data['events'];
  return events.map(r => {
    return {
      ...r,
      ..._.fromPairs(_.map(r.dataValues, i => [dataElements[i['dataElement']], i.value]))
    };
  });
}


export function mapEvents2(data, dataElements) {
  const events = data['events'];
  dataElements = _.invert(dataElements);
  return events.map(r => {
    return {
      ...r,
      dataValues: _.fromPairs(_.map(r.dataValues, i => [dataElements[i['dataElement']], i.value])),
      ..._.fromPairs(_.map(r.dataValues, i => [dataElements[i['dataElement']], i.value]))
    };
  });
}

export function mapTrackedEntityInstances(data, attributes) {
  const results = data['trackedEntityInstances'];
  const orgUnits = _.uniq(results.map(o => o.orgUnit)).join(',');
  attributes = _.invert(attributes);
  return results.map(r => {
    return {
      ...r,
      attributes: _.fromPairs(_.map(r.attributes, i => [i['attribute'], i.value])),
      ..._.fromPairs(_.map(r.attributes, i => [attributes[i.attribute], i.value])),
      orgUnits,
      original: r
    };
  });
}

export function mapTrackedEntityInstance(data, attributes) {
  attributes = _.invert(attributes);
  return {
    ...data,
    attributes: _.fromPairs(_.map(data['attributes'], i => [i.attribute, i.value])),
    ..._.fromPairs(_.map(data['attributes'], i => [attributes[i.attribute], i.value])),
  };
}

export function mapEvent(data) {
  return {
    ...data,
    dataValues: _.fromPairs(_.map(data['dataValues'], i => [i['dataElement'], i.value]))
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
