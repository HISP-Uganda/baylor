import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {AppLoadingService, Dhis2Service} from '../core';
import {ActionDialogComponent} from '../activity/dialogs.component';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-report-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class ReportIssueComponent implements OnInit {

  displayedColumns = ['activity', 'issue', 'registrationDate', 'orgUnitName', 'reportedBy', 'responsiblePerson', 'issueStatus', 'action'];

  constructor(public loaderService: AppLoadingService,
              private api: Dhis2Service,
              public router: Router,
              private route: ActivatedRoute,
              private baylorStore: BaylorStore,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    let reportId;
    this.route.paramMap.subscribe(params => {
      reportId = params.get('report');
      this.baylorStore.getReportIssues(reportId);
    });
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
        this.baylorStore.addAction(issue, result);
      }
    });
  }
}
