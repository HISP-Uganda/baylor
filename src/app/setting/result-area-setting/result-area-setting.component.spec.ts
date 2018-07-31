import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultAreaSettingComponent } from './result-area-setting.component';

describe('ResultAreaSettingComponent', () => {
  let component: ResultAreaSettingComponent;
  let fixture: ComponentFixture<ResultAreaSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultAreaSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultAreaSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
