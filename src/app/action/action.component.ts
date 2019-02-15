import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {actionDataElements, AppLoadingService} from '../core';
import {BaylorStore} from '../store/baylor.store';


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent implements OnInit {

  displayedColumns = ['activity', 'issue', ..._.keys(actionDataElements)];
  constructor(public loaderService: AppLoadingService, private baylorStore: BaylorStore) {
  }

  ngOnInit() {
    this.baylorStore.fetchIssues();
  }
}
