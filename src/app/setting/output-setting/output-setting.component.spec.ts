import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputSettingComponent } from './output-setting.component';

describe('OutputSettingComponent', () => {
  let component: OutputSettingComponent;
  let fixture: ComponentFixture<OutputSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutputSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
