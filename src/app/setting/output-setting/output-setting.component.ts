import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {AppLoadingService, Dhis2Service} from '../../core';
import {Router} from '@angular/router';
import {OutputDialogComponent} from '../dialogs.component';

@Component({
  selector: 'app-output-setting',
  templateUrl: './output-setting.component.html',
  styleUrls: ['./output-setting.component.css']
})
export class OutputSettingComponent implements OnInit {

  displayedColumns = [
    'description',
    'output',
    'period',
    'project',
    'actions'
  ];

  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  outputs = [];

  constructor(public loaderService: AppLoadingService, private api: Dhis2Service, public router: Router, public dialog: MatDialog) {
  }

  ngOnInit() {

    this.api
      .getFromDataStore('baylor', 'outputs')
      .subscribe(
        (response) => {
          this.outputs = response;
        }, error1 => {
        }, () => {
          this.dataSource = new MatTableDataSource<any>(this.outputs);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
  }

  openDialog(action, data): void {
    data = {...data, ...action};
    const dialogRef = this.dialog.open(OutputDialogComponent, {
      width: '600px',
      data,
    });
    dialogRef.afterClosed().subscribe(result => {
      const {editing, viewing} = data;
      if (result) {
        if (editing) {
          const {index} = data;
          this.outputs[index] = result;
          this.api.updateDataStore('baylor', 'outputs', this.outputs).subscribe(response => {
          }, error1 => console.log(error1), () => {
            this.dataSource = new MatTableDataSource<any>(this.outputs);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else if (viewing) {

        } else {
          this.outputs = [...this.outputs, result];
          if (this.outputs.length > 1) {
            this.api.updateDataStore('baylor', 'outputs', this.outputs).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.outputs);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          } else {
            this.api.addToDataStore('baylor', 'outputs', this.outputs).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.outputs);
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
