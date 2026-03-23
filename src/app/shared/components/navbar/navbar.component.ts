import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/profile.model';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <a routerLink="/" class="brand">
        <img src="askmeapp-horizontal-light.svg" alt="AskMe App" class="logo" />
      </a>
      <span class="spacer"></span>

      @if (currentUser) {
        <span class="username-chip">@{{ profile?.username }}</span>
        <button mat-icon-button [matMenuTriggerFor]="menu" color="primary">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </button>
          <button mat-menu-item (click)="copyLink()">
            <mat-icon>link</mat-icon>
            <span>Copiar meu link</span>
          </button>
          <button mat-menu-item (click)="auth.signOut()">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/login">Entrar</a>
        <a mat-raised-button color="primary" routerLink="/register">Cadastrar</a>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: white;
      border-bottom: 1px solid #eee;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .brand { text-decoration: none; display: flex; align-items: center; }
    .logo { height: 36px; width: auto; }
    .spacer { flex: 1; }
    .username-chip { margin-right: 8px; font-size: 0.9rem; color: #555; }
  `]
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  private profileService = inject(ProfileService);

  currentUser: User | null = null;
  profile: Profile | null = null;

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(async user => {
      this.currentUser = user;
      if (user) {
        this.profile = await this.profileService.getProfileById(user.id);
      } else {
        this.profile = null;
      }
    });
  }

  copyLink(): void {
    if (this.profile) {
      const link = `${window.location.origin}/u/${this.profile.username}`;
      navigator.clipboard.writeText(link);
    }
  }
}
