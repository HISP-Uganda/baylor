import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {AppLoadingService, Dhis2Service, issueAttributes, mapTrackedEntityInstances} from '../core';
import {IssueDialogComponent} from '../activity/dialogs.component';
import * as _ from 'lodash';
import * as Moment from 'moment';

@Component({
  selector: 'app-report-issue',
  templateUrl: './report-issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class ReportIssueComponent implements OnInit {

  actions = [];
  dataSource = null;
  activity = null;
  noData = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['transactionCode', 'orgUnit', 'issue', 'issueStatus', 'action'];

  constructor(public loaderService: AppLoadingService,
              private api: Dhis2Service,
              public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    let issues;
    let reportId;
    this.route.paramMap.subscribe(params => {
      reportId = params.get('report');
      this.api.issues(reportId).subscribe(response => {
        issues = response;
      }, e => console.log(e), () => {
        issues = mapTrackedEntityInstances(issues, issueAttributes);
        if (issues.length === 0) {
          this.noData = true;
        }
        this.dataSource = new MatTableDataSource<any>(issues);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }

  viewActions(issue) {
    this.router.navigate(['/actions', issue.trackedEntityInstance]);
  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(IssueDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
        const enrollments = [{
          orgUnit: this.activity['orgUnit'],
          program: 'bsg7cZMTqgI',
          enrollmentDate: date,
          incidentDate: date
        }];

        _.forOwn(issueAttributes, function (attribute, key) {
          if (result[key]) {
            attributes = [...attributes, {attribute, value: result[key]}];
          }
        });
        const trackedEntityInstance = {
          orgUnit: data['orgUnit'],
          trackedEntityType: 'MCPQUTHX1Ze',
          attributes,
          enrollments
        };
        if (result.trackedEntityInstance) {
          trackedEntityInstance['trackedEntityInstance'] = result.trackedEntityInstance;
        }

        const instances = {trackedEntityInstances: [trackedEntityInstance]};

        this.api.postTrackedEntity(instances).subscribe(hero => {
        }, error => {
          this.snackBar.open(error, 'Failed to save or update issue', {
            duration: 2000,
          });
        }, () => {
          this.snackBar.open('Issue saved successfully', 'OK', {
            duration: 2000,
          });
        });
      }
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
