import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordUpdate } from './record-update';

describe('RecordUpdate', () => {
  let component: RecordUpdate;
  let fixture: ComponentFixture<RecordUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
