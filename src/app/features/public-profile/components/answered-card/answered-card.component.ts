import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnsweredQuestion } from '../../../../core/models/question.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-answered-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, TimeAgoPipe],
  template: `
    <mat-card class="answered-card">
      <mat-card-content>
        <div class="question-section">
          <mat-icon class="q-icon">help_outline</mat-icon>
          <div>
            <p class="question-text">{{ item.questions.content }}</p>
            <span class="meta">
              {{ item.questions.sender_name || 'Anônimo' }} · {{ item.questions.created_at | timeAgo }}
            </span>
          </div>
        </div>
        <div class="answer-section">
          <mat-icon class="a-icon">reply</mat-icon>
          <div>
            <p class="answer-text">{{ item.content }}</p>
            <span class="meta">{{ item.created_at | timeAgo }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .answered-card { margin-bottom: 16px; }
    .question-section { display: flex; gap: 12px; margin-bottom: 16px; }
    .answer-section { display: flex; gap: 12px; background: #f3f0ff; border-radius: 8px; padding: 12px; }
    .q-icon { color: #999; flex-shrink: 0; }
    .a-icon { color: #6750A4; flex-shrink: 0; }
    .question-text, .answer-text { margin: 0 0 4px; line-height: 1.5; }
    .question-text { font-size: 1rem; }
    .answer-text { font-size: 1rem; color: #333; }
    .meta { font-size: 0.8rem; color: #999; }
  `]
})
export class AnsweredCardComponent {
  @Input() item!: AnsweredQuestion;
}
