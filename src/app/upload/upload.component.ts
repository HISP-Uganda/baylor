import {Component, Input} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DialogComponent} from './dialog/dialog.component';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {Router} from '@angular/router';
import {Dhis2Service, reportDataElements} from '../core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  @Input() owner;
  @Input() field: string;

  constructor(public dialog: MatDialog, public api: Dhis2Service, public snackBar: MatSnackBar, public router: Router) {
  }

  public openUploadDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {width: '50%', height: '40%'});
    dialogRef.afterClosed().subscribe(result => {
      const reports = _.map(result, (v, key) => {
        return v.uid;
      });

      let dataValues = [{dataElement: this.field, value: reports[0]}];
      _.forOwn(reportDataElements, (dataElement, key) => {
        if (this.owner[key]) {
          dataValues = [...dataValues, {dataElement, value: this.owner[key]}];
        }
      });

      const event = {
        trackedEntityInstance: this.owner['trackedEntityInstance'],
        program: 'MLb410Oz6cU',
        orgUnit: this.owner['orgUnit'],
        status: 'COMPLETED',
        event: this.owner.event,
        programStage: 'FxImolXHCbY',
        eventDate: Moment(this.owner['eventDate']).format('YYYY-MM-DD'),
        dataValues
      };
      this.api.postEvent(event).subscribe(e => {
        this.snackBar.open('Report uploaded successfully', 'OK', {
          duration: 2000,
        });
        this.router.navigate(['/activities', this.owner['trackedEntityInstance']]);
      });
    });
  }
}
