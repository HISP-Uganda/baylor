import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

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

  public addToDataStore(namespace, key, value): Observable<any> {
    return this.http.post(API_URL + '/dataStore/' + namespace + '/' + key, value, httpOptions);
  }

  public updateDataStore(namespace, key, value): Observable<any> {
    return this.http.put(API_URL + '/dataStore/' + namespace + '/' + key, value, httpOptions);
  }

  public getFromDataStore(namespace, key): Observable<any> {
    return this.http.get(API_URL + '/dataStore/' + namespace + '/' + key);
  }

  public getLevels(): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('fields', 'id,level,displayName,name');
    return this.http.get(API_URL + '/organisationUnitLevels', {params});
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

  public getEvents(trackedEntityInstance): Observable<any> {
    const params = new HttpParams()
      .set('paging', 'false')
      .set('trackedEntityInstance', trackedEntityInstance);
    return this.http
      .get(API_URL + '/events', {params});
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

  public getOptions(optionSet): Observable<any> {
    const params = new HttpParams()
      .set('fields', 'options[id,displayName,code]');
    return this.http
      .get(API_URL + '/optionSets/' + optionSet, {params});
  }

  public postTrackedEntity(data) {
    return this.http.post(API_URL + '/trackedEntityInstances', data, httpOptions);
  }

  public postEvent(data) {
    return this.http.post(API_URL + '/events', data, httpOptions);
  }

  public updateTrackedEntity(trackedEntity, data) {
    return this.http.put(API_URL + '/trackedEntityInstances/' + trackedEntity, data, httpOptions);
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
}
