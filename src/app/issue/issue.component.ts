import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {AppLoadingService, Dhis2Service} from '../core';
import {ActionDialogComponent} from '../activity/dialogs.component';
import {BaylorStore} from '../store/baylor.store';
import * as Moment from 'moment';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {

  displayedColumns = ['activity', 'issue', 'registrationDate', 'orgUnitName', 'reportedBy', 'responsiblePerson', 'issueStatus', 'action'];

  constructor(public dialog: MatDialog, public loaderService: AppLoadingService,
              private api: Dhis2Service, public router: Router,
              private baylorStore: BaylorStore, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.baylorStore.setIssueSearches([]);
    this.baylorStore.fetchIssues();
  }

  viewActions(issue) {
    this.router.navigate(['/actions', issue.trackedEntityInstance]);
  }

  openActionDialog(data, issue): void {
    data.issue = issue.issue;
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const actionStartDate = result['actionStartDate'];
        const actionEndDate = result['actionEndDate'];

        if (actionEndDate instanceof Moment) {
          result['actionEndDate'] = result['actionEndDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(actionEndDate) === '[object Date]') {
          result['actionEndDate'] = Moment(actionEndDate).format('YYYY-MM-DD');
        }

        if (actionStartDate instanceof Moment) {
          result['actionStartDate'] = result['actionStartDate'].format('YYYY-MM-DD');
        } else if (Object.prototype.toString.call(actionStartDate) === '[object Date]') {
          result['actionStartDate'] = Moment(actionStartDate).format('YYYY-MM-DD');
        }
        this.baylorStore.addAction(issue, result);
      }
    });
  }

  /*openActionDialog(data, issue, index): void {
    data.issue = issue.issue;
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
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
              // this.issues[index] = issue;
              // this.dataSource = new MatTableDataSource<any>(this.issues);
              // this.dataSource.paginator = this.paginator;
              // this.dataSource.sort = this.sort;
            });
          }
        });
      }
    });
  }*/
}
