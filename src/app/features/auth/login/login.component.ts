import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Entrar</mat-card-title>
          <mat-card-subtitle>Bem-vindo de volta!</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <button mat-stroked-button class="google-btn" (click)="signInWithGoogle()" type="button">
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google">
            Continuar com Google
          </button>

          <div class="divider">
            <span class="divider-text">ou</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (errorMessage) {
              <p class="error-msg">{{ errorMessage }}</p>
            }

            <button mat-raised-button color="primary" class="full-width submit-btn" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p class="register-link">Não tem conta? <a routerLink="/register">Cadastrar</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px); padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; padding: 16px; }
    mat-card-header { margin-bottom: 24px; }
    .google-btn { width: 100%; display: flex; align-items: center; gap: 12px; justify-content: center; padding: 8px; }
    .divider { display: flex; align-items: center; text-align: center; margin: 24px 0; }
    .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #ddd; }
    .divider-text { padding: 0 12px; color: #999; font-size: 0.85rem; }
    .full-width { width: 100%; }
    mat-form-field { margin-bottom: 8px; }
    .submit-btn { margin-top: 16px; padding: 12px; }
    .error-msg { color: #d32f2f; font-size: 0.85rem; }
    .register-link { text-align: center; font-size: 0.9rem; }
    .register-link a { color: #6750A4; text-decoration: none; font-weight: 500; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;
  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.auth.signInWithEmail(this.form.value.email!, this.form.value.password!);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err.message || 'E-mail ou senha incorretos';
    } finally {
      this.loading = false;
    }
  }

  signInWithGoogle(): void {
    this.auth.signInWithGoogle();
  }
}
