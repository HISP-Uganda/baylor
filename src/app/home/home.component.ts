import { Dhis2Service } from '../core/dhis2.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'Home';
  constructor(private _dhis2: Dhis2Service, private _formBuilder: FormBuilder) {
  }
  ngOnInit() {
  }

  save() {
  }
}
