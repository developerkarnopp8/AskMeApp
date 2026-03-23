import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { QuestionService } from '../../core/services/question.service';
import { Question } from '../../core/models/question.model';
import { Profile } from '../../core/models/profile.model';
import { QuestionCardComponent } from './components/question-card/question-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    QuestionCardComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Olá, {{ profile?.display_name || profile?.username }}!</h1>
          @if (profile) {
            <p class="link-info">
              Seu link: <strong>{{ origin }}/u/{{ profile.username }}</strong>
              <button mat-icon-button (click)="copyLink()" title="Copiar link">
                <mat-icon>content_copy</mat-icon>
              </button>
            </p>
          }
        </div>
        <div class="share-actions">
          @if (profile) {
            <a mat-raised-button color="primary"
               [href]="'https://wa.me/?text=' + encodeURI('Me manda uma pergunta! ' + origin + '/u/' + profile.username)"
               target="_blank">
              <mat-icon>share</mat-icon> Compartilhar
            </a>
          }
        </div>
      </div>

      @if (loading) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <mat-tab-group>
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>help_outline</mat-icon>
              &nbsp;Sem resposta ({{ unanswered.length }})
            </ng-template>
            <div class="tab-content">
              @if (unanswered.length === 0) {
                <div class="empty-state">
                  <mat-icon>inbox</mat-icon>
                  <p>Nenhuma pergunta ainda. Compartilhe seu link!</p>
                </div>
              }
              @for (q of unanswered; track q.id) {
                <app-question-card [question]="q" (refreshed)="loadQuestions()"></app-question-card>
              }
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>check_circle_outline</mat-icon>
              &nbsp;Respondidas ({{ answered.length }})
            </ng-template>
            <div class="tab-content">
              @if (answered.length === 0) {
                <div class="empty-state">
                  <mat-icon>question_answer</mat-icon>
                  <p>Nenhuma pergunta respondida ainda.</p>
                </div>
              }
              @for (q of answered; track q.id) {
                <app-question-card [question]="q" (refreshed)="loadQuestions()"></app-question-card>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    h1 { font-size: 1.8rem; margin-bottom: 8px; }
    .link-info { font-size: 0.9rem; color: #555; display: flex; align-items: center; gap: 4px; }
    .tab-content { padding: 24px 0; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private questionService = inject(QuestionService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  profile: Profile | null = null;
  questions: Question[] = [];
  loading = true;
  origin = window.location.origin;
  encodeURI = encodeURIComponent;

  get unanswered(): Question[] {
    return this.questions.filter(q => !q.answer);
  }

  get answered(): Question[] {
    return this.questions.filter(q => !!q.answer);
  }

  async ngOnInit(): Promise<void> {
    await this.auth.ready;
    const user = this.auth.currentUser;
    if (user) {
      this.profile = await this.profileService.getProfileById(user.id);
      await this.loadQuestions();
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadQuestions(): Promise<void> {
    this.loading = true;
    try {
      const user = this.auth.currentUser;
      if (user) {
        this.questions = await this.questionService.getQuestionsForDashboard(user.id);
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  copyLink(): void {
    if (this.profile) {
      navigator.clipboard.writeText(`${this.origin}/u/${this.profile.username}`);
      this.snackBar.open('Link copiado!', '', { duration: 2000 });
    }
  }
}
