import {Component, ViewChild} from '@angular/core';
import {UploadService} from '../upload.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  @ViewChild('file') file;
  public files: Set<File> = new Set();

  progress;
  canBeClosed = true;
  primaryButtonText = 'Upload';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;
  uids = [];

  constructor(public dialogRef: MatDialogRef<DialogComponent>, public uploadService: UploadService) {
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (const key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
  }

  closeDialog() {
    // if everything was uploaded already, just close the dialog
    if (this.uploadSuccessful) {
      return this.dialogRef.close(this.progress);
    }
    // set the component state to "uploading"
    this.uploading = true;

    // start the upload and save the progress map
    this.progress = this.uploadService.upload(this.files);

    // convert the progress map into an array
    for (let key in this.progress) {
      // allProgressObservables.push(this.progress[key].progress);
      this.uids = this.progress[key]['uid'];
    }
    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';
    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;
    // Hide the cancel-button
    this.showCancelButton = false;
    this.canBeClosed = true;
    this.dialogRef.disableClose = false;
    // ... the upload was successful...
    this.uploadSuccessful = true;
    // ... and the component is no longer uploading
    this.uploading = false;
  }
}
