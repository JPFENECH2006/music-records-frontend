import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordView } from './record-view';

describe('RecordView', () => {
  let component: RecordView;
  let fixture: ComponentFixture<RecordView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
