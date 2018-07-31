import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {AppLoadingService, Dhis2Service} from '../../core/';
import {ProjectDialogComponent} from '../dialogs.component';

@Component({
  selector: 'app-project-setting',
  templateUrl: './project-setting.component.html',
  styleUrls: ['./project-setting.component.css']
})
export class ProjectSettingComponent implements OnInit {

  displayedColumns = [
    'projectCode',
    'projectName',
    'projectYear',
    'actions'
  ];

  dataSource = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  projects = [];

  // emptyProject = {projectCode: null, projectName: null, projectYear: new Date().getFullYear()};

  constructor(public loaderService: AppLoadingService, private api: Dhis2Service, public router: Router, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.api
      .getFromDataStore('baylor', 'projects')
      .subscribe(
        (projects) => {
          this.projects = projects;
        }, error1 => console.log(error1), () => {
          this.dataSource = new MatTableDataSource<any>(this.projects);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
  }

  openDialog(action, data): void {
    data = {...data, ...action};
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      data,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const {editing, viewing} = data;

        if (editing) {
          const {index} = data;
          this.projects[index] = result;
          this.api.updateDataStore('baylor', 'projects', this.projects).subscribe(response => {
          }, error1 => console.log(error1), () => {
            this.dataSource = new MatTableDataSource<any>(this.projects);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else if (viewing) {

        } else {
          this.projects = [...this.projects, result];
          if (this.projects.length > 1) {
            this.api.updateDataStore('baylor', 'projects', this.projects).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.projects);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
          } else {
            this.api.addToDataStore('baylor', 'projects', this.projects).subscribe(response => {
            }, error1 => console.log(error1), () => {
              this.dataSource = new MatTableDataSource<any>(this.projects);
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
