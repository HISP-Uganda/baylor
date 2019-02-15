import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {actionDataElements, AppLoadingService, Dhis2Service} from '../core';
import {BaylorStore} from '../store/baylor.store';

@Component({
  selector: 'app-issue-action',
  templateUrl: './issue-action.component.html',
  styleUrls: ['./action.component.css']
})
export class IssueActionComponent implements OnInit {


  displayedColumns = ['activity', 'issue', ..._.keys(actionDataElements)];

  constructor(public loaderService: AppLoadingService, private baylorStore: BaylorStore,
              private api: Dhis2Service, public router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const issueId = params.get('issue');
      this.baylorStore.setCurrentIssue(issueId);
    });
  }
}
