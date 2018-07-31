import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

const API_URL = environment.apiUrl;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class Dhis2Service {

  constructor(private http: HttpClient) {
  }

  public getPrograms(): Observable<Object> {
    const params = new HttpParams().set('fields', 'id,displayName,programType')
      .set('paging', 'false');
    return this.http.get(API_URL + '/programs.json', {params});
  }

  public getProgram(program): Observable<any> {
    const params = new HttpParams().set('fields', 'id,displayName,programType,trackedEntityType,' +
      'programTrackedEntityAttributes[trackedEntityAttribute[id,code,displayName]],programStages[id,displayName,repeatable,' +
      'programStageDataElements[dataElement[id,displayName]]]');
    return this.http.get(API_URL + '/programs/' + program + '.json', {params});
  }

  public addToDataStore(namespace, key, value): Observable<any> {
    return this.http.post(API_URL + '/dataStore/' + namespace + '/' + key, value, httpOptions);
  }

  public addEvent(data): Observable<any> {
    return this.http.post(API_URL + '/events', data, httpOptions);
  }

  public addTrackedEntity(data): Observable<any> {
    return this.http.post(API_URL + '/trackedEntityInstances', data, httpOptions);
  }

  public updateDataStore(namespace, key, value): Observable<any> {
    return this.http.put(API_URL + '/dataStore/' + namespace + '/' + key, value, httpOptions);
  }

  public getFromDataStore(namespace, key): Observable<any> {
    return this.http.get(API_URL + '/dataStore/' + namespace + '/' + key);
  }

  public getAllDataStore(namespace): Observable<any> {
    return this.http.get(API_URL + '/dataStore/' + namespace);
  }

  public getTables(): Observable<any> {
    return this.http.get('./assets/tablesColumns.json');
  }

  public getLevels(): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('fields', 'id,level,displayName,name');
    return this.http.get(API_URL + '/organisationUnitLevels', {params});
  }

  public getOrgUnitsWithCodes(): Observable<any> {
    const params = new HttpParams()
      .set('fields', 'id,code')
      .set('filter', 'code:!null')
      .set('paging', 'false');
    return this.http
      .get(API_URL + '/organisationUnits', {params});
  }

  public searchTrackedEntities(uniqueIdAttribute, uniqueId, program, orgUnit): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('program', program)
      .set('ou', orgUnit)
      .set('filter', uniqueIdAttribute + ':EQ:' + uniqueId)
      .set('fields', 'trackedEntityInstance,orgUnit,attributes[attribute,value],enrollments[enrollment,program,' +
        'trackedEntityInstance,trackedEntityType,enrollmentDate,incidentDate,orgUnit,events[program,event,eventDate,programStage,' +
        'dataValues[dataElement,value]]]');
    return this.http.get(API_URL + '/trackedEntityInstances', {params});
  }

  public getSQLViews(): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false');
    return this.http.get(API_URL + '/sqlViews', {params});
  }

  public getAttributes(program): Observable<any> {
    const params = new HttpParams()
      .set('fields', 'programTrackedEntityAttributes[id,displayName]');
    return this.http
      .get(API_URL + '/programs/' + program, {params});
  }

  public getAllEvents(program): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('ouMode', 'ALL')
      .set('program', program)
      .set('fields', ':all');
    return this.http
      .get(API_URL + '/events', {params});
  }


  public getEvent(event): Observable<any> {
    const params = new HttpParams()
      .set('fields', ':all');
    return this.http
      .get(API_URL + '/events/' + event, {params});
  }

  public getEvents(trackedEntityInstance): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('trackedEntityInstance', trackedEntityInstance);
    return this.http
      .get(API_URL + '/events', {params});
  }

  public getReports(activityTransaction): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('program', 'MLb410Oz6cU')
      .set('filter', 'VLWHxrfUs9T:EQ:' + activityTransaction)
      .set('ouMode', 'ALL');
    return this.http
      .get(API_URL + '/trackedEntityInstances', {params});
  }

  public getFullTrackedEntity(trackedEntity) {
    const params = new HttpParams()
      .set('fields', 'trackedEntityInstance,orgUnit,attributes[attribute,value],enrollments[enrollment,program,' +
        'trackedEntityInstance,trackedEntityType,enrollmentDate,incidentDate,orgUnit,' +
        'events[program,trackedEntityInstance,event,eventDate,programStage,orgUnit,dataValues[dataElement,value]]]');

    return this.http
      .get(API_URL + '/trackedEntityInstances/' + trackedEntity, {params});
  }


  public getTrackedEntity(entity): Observable<any> {
    const params = new HttpParams()
      .set('fields', ':all');
    return this.http
      .get(API_URL + '/trackedEntityInstances/' + entity, {params});
  }

  public getTrackedEntities(program): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('ouMode', 'ALL')
      .set('program', program);

    return this.http
      .get(API_URL + '/trackedEntityInstances', {params});
  }

  public issues(activityTransaction): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('ouMode', 'ALL')
      .set('filter', 'RIxrFZS2TIe:EQ:' + activityTransaction)
      .set('program', 'bsg7cZMTqgI');

    return this.http
      .get(API_URL + '/trackedEntityInstances', {params});
  }

  public getOrgUnits(units): Observable<any> {
    const params = new HttpParams().set('filter', 'id:in:[' + units + ']').set('paging', 'false');
    return this.http
      .get(API_URL + '/organisationUnits', {params});
  }

  public getOrgUnitChildren(unit, level): Observable<any> {
    const params = new HttpParams()
      .set('fields', level)
      .set('paging', 'false');
    return this.http
      .get(API_URL + '/organisationUnits/' + unit, {params});
  }

  public getDataElements(elements): Observable<any> {
    const params = new HttpParams()
      .set('filter', 'id:in:[' + elements + ']')
      .set('paging', 'false');
    return this.http
      .get(API_URL + '/dataElements', {params});
  }

  public getOptions(optionSet): Observable<any> {
    const params = new HttpParams()
      .set('fields', 'options[id,displayName,code]');
    return this.http
      .get(API_URL + '/optionSets/' + optionSet, {params})
      ;
  }

  public postTrackedEntity(data) {
    return this.http.post(API_URL + '/trackedEntityInstances', data, httpOptions);
  }

  public postEvent(data) {
    return this.http.post(API_URL + '/events', data, httpOptions);
  }

  public updateEvent(event, data) {
    return this.http.put(API_URL + '/events/' + event, data, httpOptions);
  }

  public updateTrackedEntity(trackedEntity, data) {
    return this.http.put(API_URL + '/trackedEntityInstances/' + trackedEntity, data, httpOptions);
  }

  private handleError(error: Response | any) {
    let message = '';
    if (error['status'] === 409) {
      const summaries = error['error']['response']['importSummaries'];
      if (summaries) {
        message = _.map(summaries, 'description').join('\n');
      }
    } else if (error['status'] === 500) {
      console.log(error);
    }
    return Observable.throw(message);
  }

  public convert(data) {
    return {
      text: data.displayName,
      value: data.id,
      children: data.children.map(this.convert)

    };
  }

  public getUserDetails() {
    const params = new HttpParams()
      .set('fields', 'id,surname,firstName,displayName,userCredentials[userRoles[name]]');
    return this.http
      .get(API_URL + '/me', {params});
  }

  public getAllUserDetails() {
    const params = new HttpParams()
      .set('fields', 'id,surname,firstName,displayName,userCredentials[userRoles[name,code,authorities]]')
      .set('paging', 'false');
    return this.http
      .get(API_URL + '/users', {params});
  }

  public executeSQLView(view): Observable<any> {
    return this.http.post(API_URL + '/sqlViews/' + view + '/execute', {});
  }

  public getSQLViewData(view): Observable<any> {
    return this.http.get(API_URL + '/sqlViews/' + view + '/data');
  }

  public getTemplate(url): Observable<any> {
    return this.http.get(url);
  }

  public getData(url): Observable<any> {
    return this.http.get(url);
  }
}
