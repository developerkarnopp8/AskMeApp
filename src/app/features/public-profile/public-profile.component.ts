import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { QuestionService } from '../../core/services/question.service';
import { Profile } from '../../core/models/profile.model';
import { AnsweredQuestion } from '../../core/models/question.model';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { AnsweredCardComponent } from './components/answered-card/answered-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    QuestionFormComponent,
    AnsweredCardComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="profile-container">
      @if (loading) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (!profile) {
        <div class="not-found">
          <h2>Usuário não encontrado</h2>
          <a mat-button routerLink="/">Voltar ao início</a>
        </div>
      } @else {
        <div class="profile-header">
          <div class="avatar">{{ profile.display_name?.[0]?.toUpperCase() || profile.username[0].toUpperCase() }}</div>
          <h1>{{ profile.display_name || profile.username }}</h1>
          <p class="handle">&#64;{{ profile.username }}</p>
        </div>

        <app-question-form [recipientId]="profile.id"></app-question-form>

        <section class="answers-section">
          <h2>Respostas ({{ answeredQuestions.length }})</h2>
          @if (answeredQuestions.length === 0) {
            <div class="empty-state">
              <p>Nenhuma pergunta respondida ainda. Seja o primeiro a perguntar!</p>
            </div>
          }
          @for (item of answeredQuestions; track item.id) {
            <app-answered-card [item]="item"></app-answered-card>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 700px; margin: 0 auto; padding: 32px 24px; }
    .profile-header { text-align: center; margin-bottom: 32px; }
    .avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: #6750A4; color: white;
      font-size: 2rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    h1 { font-size: 1.8rem; margin-bottom: 4px; }
    .handle { color: #777; margin: 0; }
    .answers-section h2 { margin-bottom: 16px; }
    .empty-state { text-align: center; padding: 32px; color: #999; background: #f9f9f9; border-radius: 12px; }
    .not-found { text-align: center; padding: 64px; }
  `]
})
export class PublicProfileComponent implements OnInit {
  @Input() username!: string;

  private profileService = inject(ProfileService);
  private questionService = inject(QuestionService);
  private cdr = inject(ChangeDetectorRef);

  profile: Profile | null = null;
  answeredQuestions: AnsweredQuestion[] = [];
  loading = true;

  async ngOnInit(): Promise<void> {
    try {
      this.profile = await this.profileService.getProfileByUsername(this.username);
      if (this.profile) {
        this.answeredQuestions = await this.questionService.getAnsweredQuestionsForProfile(this.profile.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
