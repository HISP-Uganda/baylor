import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ActivityDialogComponent} from '../dialogs.component';
import {Router} from '@angular/router';
import {AppLoadingService, Dhis2Service} from '../../core';

@Component({
  selector: 'app-activity-setting',
  templateUrl: './activity-setting.component.html',
  styleUrls: ['./activity-setting.component.css']
})
export class ActivitySettingComponent implements OnInit {

  displayedColumns = [
    'activityCode',
    'activityName',
    'resultAreaCode',
    'financialYear',
    'expectedOutput',
    'actions'
  ];

  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  activities = [];
  users = [];

  constructor(public loaderService: AppLoadingService, private api: Dhis2Service, public router: Router, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.api
      .getFromDataStore('baylor', 'activities')
      .subscribe(
        (activities) => {
          this.activities = activities;
        }, error1 => console.log(error1), () => {
          this.dataSource = new MatTableDataSource<any>(this.activities);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
  }

  openDialog(action, data): void {
    data = {...data, ...action};
    const dialogRef = this.dialog.open(ActivityDialogComponent, {
      width: '600px',
      data,
    });
    dialogRef.afterClosed().subscribe(result => {
      const {editing, viewing} = data;
      if (result) {
        if (editing) {
          const {index} = data;
          this.activities[index] = result;
          this.api.updateDataStore('baylor', 'activities', this.activities).subscribe(response => {
          }, error1 => console.log(error1), () => {
            this.dataSource = new MatTableDataSource<any>(this.activities);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else if (viewing) {

        } else {
          this.activities = [...this.activities, result];
          if (this.activities.length > 1) {
            this.api.updateDataStore('baylor', 'activities', this.activities).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.activities);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          } else {
            this.api.addToDataStore('baylor', 'activities', this.activities).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.activities);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          }
        }
      }
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
