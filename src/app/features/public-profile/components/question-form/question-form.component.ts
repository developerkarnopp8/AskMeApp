import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuestionService } from '../../../../core/services/question.service';

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  template: `
    <div class="question-form-container">
      <h2>Envie uma pergunta</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sua pergunta</mat-label>
          <textarea matInput formControlName="content" rows="3"
            placeholder="O que você quer perguntar?"></textarea>
          @if (form.get('content')?.errors?.['required'] && form.get('content')?.touched) {
            <mat-error>Escreva sua pergunta</mat-error>
          }
          @if (form.get('content')?.errors?.['maxlength']) {
            <mat-error>Máximo 500 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-checkbox formControlName="identify" class="identify-check">
          Quero me identificar
        </mat-checkbox>

        @if (form.get('identify')?.value) {
          <mat-form-field appearance="outline" class="full-width" style="margin-top: 12px">
            <mat-label>Seu nome</mat-label>
            <input matInput formControlName="senderName" placeholder="Como você quer ser chamado?">
          </mat-form-field>
        }

        <button mat-raised-button color="primary" type="submit"
          class="send-btn" [disabled]="form.invalid || loading || sent">
          @if (sent) {
            Pergunta enviada!
          } @else {
            {{ loading ? 'Enviando...' : 'Enviar pergunta' }}
          }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .question-form-container { background: #f3f0ff; border-radius: 16px; padding: 24px; margin-bottom: 32px; }
    h2 { margin-bottom: 16px; font-size: 1.2rem; }
    .full-width { width: 100%; }
    .identify-check { display: block; margin-bottom: 8px; }
    .send-btn { margin-top: 16px; width: 100%; padding: 12px; }
  `]
})
export class QuestionFormComponent {
  @Input() recipientId!: string;
  @Output() questionSent = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private questionService = inject(QuestionService);
  private snackBar = inject(MatSnackBar);

  loading = false;
  sent = false;

  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(500)]],
    identify: [false],
    senderName: ['']
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;

    try {
      const { content, identify, senderName } = this.form.value;
      await this.questionService.submitQuestion(
        this.recipientId,
        content!,
        identify ? senderName || undefined : undefined
      );
      this.sent = true;
      this.form.reset();
      this.snackBar.open('Pergunta enviada!', '', { duration: 3000 });
      this.questionSent.emit();

      setTimeout(() => { this.sent = false; }, 3000);
    } catch {
      this.snackBar.open('Erro ao enviar pergunta', '', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
