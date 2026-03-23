import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { Profile } from '../../core/models/profile.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="hero">
      <div class="hero-content">
        <img src="askmeapp-badge.svg" alt="AskMe App" class="hero-badge" />
        <h1>Receba perguntas <span class="accent">anônimas</span></h1>
        <p>Compartilhe seu link e deixe as pessoas te perguntarem o que quiserem, de forma anônima ou identificada.</p>

        @if (profile) {
          <mat-card class="link-card">
            <mat-card-content>
              <p class="link-label">Seu link para compartilhar:</p>
              <div class="link-row">
                <span class="link-text">{{ origin }}/u/{{ profile.username }}</span>
                <button mat-icon-button (click)="copyLink()" title="Copiar">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <div class="share-buttons">
                <a mat-stroked-button [href]="whatsappLink" target="_blank">
                  <mat-icon>share</mat-icon> WhatsApp
                </a>
                <a mat-stroked-button [href]="instagramLink" target="_blank">
                  <mat-icon>photo_camera</mat-icon> Instagram
                </a>
              </div>
            </mat-card-content>
          </mat-card>
        } @else {
          <div class="cta-buttons">
            <a mat-raised-button color="primary" routerLink="/register">Criar minha conta</a>
            <a mat-button routerLink="/login">Já tenho conta</a>
          </div>
        }
      </div>

      <div class="features">
        <div class="feature">
          <mat-icon>lock</mat-icon>
          <h3>100% Anônimo</h3>
          <p>Quem pergunta escolhe se quer se identificar ou não.</p>
        </div>
        <div class="feature">
          <mat-icon>share</mat-icon>
          <h3>Fácil de Compartilhar</h3>
          <p>Compartilhe no Instagram, WhatsApp e Facebook.</p>
        </div>
        <div class="feature">
          <mat-icon>question_answer</mat-icon>
          <h3>Responda Publicamente</h3>
          <p>Suas respostas ficam visíveis no seu perfil.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
    .hero-content { text-align: center; margin-bottom: 64px; }
    .hero-badge { width: 100%; max-width: 420px; height: auto; margin-bottom: 32px; border-radius: 24px; }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; }
    .accent { color: #6750A4; }
    p { font-size: 1.1rem; color: #555; margin-bottom: 32px; }
    .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .link-card { max-width: 500px; margin: 0 auto; }
    .link-label { font-size: 0.85rem; color: #777; margin-bottom: 8px; }
    .link-row { display: flex; align-items: center; gap: 8px; background: #f5f5f5; padding: 8px 12px; border-radius: 8px; }
    .link-text { font-family: monospace; font-size: 0.95rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .share-buttons { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; justify-content: center; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
    .feature { text-align: center; padding: 24px; background: #f9f9f9; border-radius: 12px; }
    .feature mat-icon { font-size: 40px; width: 40px; height: 40px; color: #6750A4; margin-bottom: 12px; }
    .feature h3 { margin-bottom: 8px; }
    .feature p { font-size: 0.9rem; color: #666; margin: 0; }
  `]
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);

  profile: Profile | null = null;
  origin = window.location.origin;

  get whatsappLink(): string {
    const url = `${this.origin}/u/${this.profile?.username}`;
    return `https://wa.me/?text=${encodeURIComponent('Me manda uma pergunta! ' + url)}`;
  }

  get instagramLink(): string {
    return `https://www.instagram.com/`;
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(async user => {
      if (user) {
        this.profile = await this.profileService.getProfileById(user.id);
      }
    });
  }

  copyLink(): void {
    if (this.profile) {
      navigator.clipboard.writeText(`${this.origin}/u/${this.profile.username}`);
    }
  }
}
