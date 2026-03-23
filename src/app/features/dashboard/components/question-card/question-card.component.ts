import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Question } from '../../../../core/models/question.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { AnswerFormComponent } from '../answer-form/answer-form.component';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, TimeAgoPipe, AnswerFormComponent],
  template: `
    <mat-card class="question-card" [class.answered]="question.answer">
      <mat-card-content>
        <div class="meta">
          <span class="sender">
            <mat-icon>{{ question.sender_name ? 'person' : 'visibility_off' }}</mat-icon>
            {{ question.sender_name || 'Anônimo' }}
          </span>
          <span class="time">{{ question.created_at | timeAgo }}</span>
        </div>

        <p class="question-text">{{ question.content }}</p>

        @if (question.answer) {
          <div class="answer-section">
            <mat-icon class="answer-icon">reply</mat-icon>
            <p class="answer-text">{{ question.answer.content }}</p>
          </div>
        }

        @if (!question.answer && !showForm) {
          <button mat-stroked-button color="primary" (click)="showForm = true">
            <mat-icon>reply</mat-icon> Responder
          </button>
        }

        @if (showForm) {
          <app-answer-form
            [questionId]="question.id"
            (answered)="onAnswered()"
            (cancelled)="showForm = false">
          </app-answer-form>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .question-card { margin-bottom: 16px; border-left: 4px solid #e0e0e0; }
    .question-card.answered { border-left-color: #6750A4; }
    .meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #777; font-size: 0.85rem; }
    .sender { display: flex; align-items: center; gap: 4px; }
    .sender mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .time { margin-left: auto; }
    .question-text { font-size: 1rem; margin-bottom: 12px; line-height: 1.5; }
    .answer-section { background: #f3f0ff; border-radius: 8px; padding: 12px; display: flex; gap: 8px; margin-bottom: 12px; }
    .answer-icon { color: #6750A4; flex-shrink: 0; }
    .answer-text { margin: 0; color: #333; line-height: 1.5; }
  `]
})
export class QuestionCardComponent {
  @Input() question!: Question;
  @Output() refreshed = new EventEmitter<void>();

  showForm = false;

  onAnswered(): void {
    this.showForm = false;
    this.refreshed.emit();
  }
}
