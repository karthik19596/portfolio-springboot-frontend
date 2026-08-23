import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskRequest, TASK_PRIORITIES, TASK_STATUSES } from '../../models/task';

export interface TaskDialogData {
  task?: Task;
}

@Component({
  selector: 'app-task-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {
  private readonly fb = inject(FormBuilder);

  isEdit = false;
  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    status: 'TODO' as Task['status'],
    priority: 'MEDIUM' as Task['priority'],
  });

  statuses = TASK_STATUSES;
  priorities = TASK_PRIORITIES;

  constructor(
    public readonly dialogRef: MatDialogRef<TaskDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: TaskDialogData
  ) {
    if (data?.task) {
      this.isEdit = true;
      this.taskForm.patchValue({
        title: data.task.title,
        description: data.task.description,
        status: data.task.status,
        priority: data.task.priority,
      });
    }
  }

  save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.taskForm.value as TaskRequest);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
