import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {actionDataElements, AppLoadingService, Dhis2Service, issueAttributes, mapOrgUnits, mapTrackedEntityInstances} from '../core';
import {ActionDialogComponent} from '../activity/dialogs.component';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {

  dataSource = null;
  issues = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['transactionCode', 'orgUnitName', 'issue', 'issueStatus', 'action'];

  constructor(public dialog: MatDialog, public loaderService: AppLoadingService,
              private api: Dhis2Service, public router: Router,
              private baylorStore: BaylorStore,
              private route: ActivatedRoute, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    let issues;
    this.api
      .getTrackedEntities('bsg7cZMTqgI')
      .subscribe(
        (response) => {
          issues = response;
        }, e => console.log(e), () => {
          this.issues = mapTrackedEntityInstances(issues, issueAttributes);
          this.api
            .getOrgUnits(this.issues[0].orgUnits)
            .subscribe(
              (orgUnits) => {
                orgUnits = mapOrgUnits(orgUnits);
                this.issues = this.issues.map((e) => {
                  return {...e, orgUnitName: orgUnits[e.orgUnit]};
                });
                this.dataSource = new MatTableDataSource<any>(this.issues);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }
            );
        });
  }

  viewActions(issue) {
    this.router.navigate(['/actions', issue.trackedEntityInstance]);

  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openActionDialog(data, issue, index): void {
    data.issue = issue.issue;
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        const ecd = result['actionStartDate'];
        const od = result['actionEndDate'];

        if (ecd instanceof Moment) {
          result['actionStartDate'] = result['actionStartDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(ecd) === '[object Date]') {
          result['actionStartDate'] = Moment(ecd).format('YYYY-MM-DD');
        }

        if (od instanceof Moment) {
          result['actionEndDate'] = result['actionEndDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(od) === '[object Date]') {
          result['actionEndDate'] = Moment(od).format('YYYY-MM-DD');
        }

        let dataValues = [];
        _.forOwn(actionDataElements, function (dataElement, key) {
          if (result[key]) {
            dataValues = [...dataValues, {dataElement, value: result[key]}];
          }
        });

        let event = {
          trackedEntityInstance: issue.trackedEntityInstance,
          program: 'bsg7cZMTqgI',
          orgUnit: issue.orgUnit,
          programStage: 'KO6z9FXmPLv',
          eventDate: result['eventDate'] || Moment().format('YYYY-MM-DD'),
          dataValues
        };

        if (result.event) {
          event['event'] = result.event;
        }

        this.api.postEvent(event).subscribe(e => {
        }, error => {
          this.snackBar.open(error, 'Failed', {
            duration: 2000,
          });
        }, () => {
          this.snackBar.open('Action saved successfully', 'OK', {
            duration: 2000,
          });
          if (result.currentIssueStatus) {
            const original = issue.original;
            const attributes = _.map(original.attributes, (value, key) => (
              {
                attribute: value.attribute,
                value: value.attribute === issueAttributes.issueStatus ? result.currentIssueStatus : value.value
              }
            ));
            const trackedEntityInstance = {
              ...original,
              attributes
            };
            issue.issueStatus = result.currentIssueStatus;

            this.api.postTrackedEntity(trackedEntityInstance).subscribe(hero => {
              this.snackBar.open('Issue updated successfully', 'OK', {
                duration: 2000,
              });
            }, error => {
              this.snackBar.open(error, 'Failed to save or update issue', {
                duration: 2000,
              });
            }, () => {
              this.issues[index] = issue;
              this.dataSource = new MatTableDataSource<any>(this.issues);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          }
        });
      }
    });
  }
}
