import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Router} from '@angular/router';
import {AppLoadingService, Dhis2Service} from '../../core';
import {ObjectiveDialogComponent} from '../dialogs.component';

@Component({
  selector: 'app-objective-setting',
  templateUrl: './objective-setting.component.html',
  styleUrls: ['./objective-setting.component.css']
})
export class ObjectiveSettingComponent implements OnInit {

  displayedColumns = [
    'objectiveCode',
    'objectiveName',
    'projectCode',
    'actions'
  ];

  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  objectives = [];

  constructor(public loaderService: AppLoadingService, private api: Dhis2Service, public router: Router, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.api
      .getFromDataStore('baylor', 'objectives')
      .subscribe(
        (objectives) => {
          this.objectives = objectives;
        }, error1 => console.log(error1), () => {
          this.dataSource = new MatTableDataSource<any>(this.objectives);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
  }

  openDialog(action, data): void {
    data = {...data, ...action};
    const dialogRef = this.dialog.open(ObjectiveDialogComponent, {
      width: '600px',
      data,
    });
    dialogRef.afterClosed().subscribe(result => {
      const {editing, viewing} = data;
      if (result) {
        if (editing) {
          const {index} = data;
          this.objectives[index] = result;
          this.api.updateDataStore('baylor', 'objectives', this.objectives).subscribe(response => {
          }, error1 => console.log(error1), () => {
            this.dataSource = new MatTableDataSource<any>(this.objectives);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else if (viewing) {

        } else {
          this.objectives = [...this.objectives, result];
          if (this.objectives.length > 1) {
            this.api.updateDataStore('baylor', 'objectives', this.objectives).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.objectives);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          } else {
            this.api.addToDataStore('baylor', 'objectives', this.objectives).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.objectives);
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
