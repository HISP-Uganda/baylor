import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {actionDataElements, AppLoadingService, Dhis2Service, mapEvents} from '../core';


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent implements OnInit {
  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = _.keys(actionDataElements);

  constructor(public loaderService: AppLoadingService, private api: Dhis2Service, public router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {

    let actions;
    this.api
      .getAllEvents('bsg7cZMTqgI')
      .subscribe(
        (response) => {
          actions = response;
        }, e => console.log(e), () => {
          actions = mapEvents(actions, actionDataElements);
          console.log(actions);
          this.dataSource = new MatTableDataSource<any>(actions);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

}
