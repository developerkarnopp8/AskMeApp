import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AnswerService } from '../../../../core/services/answer.service';

@Component({
  selector: 'app-answer-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="answer-form">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Sua resposta</mat-label>
        <textarea matInput formControlName="content" rows="3" placeholder="Digite sua resposta..."></textarea>
      </mat-form-field>
      <div class="actions">
        <button mat-button type="button" (click)="cancelled.emit()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Enviando...' : 'Responder' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .answer-form { padding: 16px 0 0; }
    .full-width { width: 100%; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class AnswerFormComponent {
  @Input() questionId!: string;
  @Output() answered = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private answerService = inject(AnswerService);

  loading = false;

  form = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(1)]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      await this.answerService.submitAnswer(this.questionId, this.form.value.content!);
      this.form.reset();
      this.answered.emit();
    } finally {
      this.loading = false;
    }
  }
}
