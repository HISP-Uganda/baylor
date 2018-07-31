import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ResultAreaDialogComponent} from '../dialogs.component';
import {AppLoadingService, Dhis2Service} from '../../core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-result-area-setting',
  templateUrl: './result-area-setting.component.html',
  styleUrls: ['./result-area-setting.component.css']
})
export class ResultAreaSettingComponent implements OnInit {

  displayedColumns = [
    'resultAreaCode',
    'resultAreaName',
    'objectiveCode',
    'actions'
  ];

  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  resultAreas = [];

  constructor(public loaderService: AppLoadingService, private api: Dhis2Service, public router: Router, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.api
      .getFromDataStore('baylor', 'resultAreas')
      .subscribe(
        (resultAreas) => {
          this.resultAreas = resultAreas;
        }, error1 => console.log(error1), () => {
          this.dataSource = new MatTableDataSource<any>(this.resultAreas);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
  }

  openDialog(action, data): void {
    data = {...data, ...action};
    const dialogRef = this.dialog.open(ResultAreaDialogComponent, {
      width: '600px',
      data,
    });
    dialogRef.afterClosed().subscribe(result => {
      const {editing, viewing} = data;
      if (result) {
        if (editing) {
          const {index} = data;
          this.resultAreas[index] = result;
          this.api.updateDataStore('baylor', 'resultAreas', this.resultAreas).subscribe(response => {
          }, error1 => console.log(error1), () => {
            this.dataSource = new MatTableDataSource<any>(this.resultAreas);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else if (viewing) {

        } else {
          this.resultAreas = [...this.resultAreas, result];
          if (this.resultAreas.length > 1) {
            this.api.updateDataStore('baylor', 'resultAreas', this.resultAreas).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.resultAreas);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          } else {
            this.api.addToDataStore('baylor', 'resultAreas', this.resultAreas).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.resultAreas);
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
