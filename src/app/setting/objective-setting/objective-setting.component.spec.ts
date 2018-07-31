import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveSettingComponent } from './objective-setting.component';

describe('ObjectiveSettingComponent', () => {
  let component: ObjectiveSettingComponent;
  let fixture: ComponentFixture<ObjectiveSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectiveSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectiveSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
