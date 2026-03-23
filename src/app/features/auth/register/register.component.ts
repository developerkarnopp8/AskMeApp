import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, debounceTime, distinctUntilChanged, first, map, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-register',
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
          <mat-card-title>Criar conta</mat-card-title>
          <mat-card-subtitle>Comece a receber perguntas hoje</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <button mat-stroked-button class="google-btn" (click)="signInWithGoogle()" type="button">
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google">
            Continuar com Google
          </button>

          <mat-divider class="divider">
            <span class="divider-text">ou</span>
          </mat-divider>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome de usuário</mat-label>
              <input matInput formControlName="username" placeholder="seunome">
              <mat-hint>Será seu link: /u/seunome</mat-hint>
              @if (form.get('username')?.errors?.['required'] && form.get('username')?.touched) {
                <mat-error>Nome de usuário obrigatório</mat-error>
              }
              @if (form.get('username')?.errors?.['pattern']) {
                <mat-error>Apenas letras, números e underline</mat-error>
              }
              @if (form.get('username')?.errors?.['taken']) {
                <mat-error>Nome de usuário já em uso</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email">
              @if (form.get('email')?.errors?.['required'] && form.get('email')?.touched) {
                <mat-error>E-mail obrigatório</mat-error>
              }
              @if (form.get('email')?.errors?.['email']) {
                <mat-error>E-mail inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.errors?.['minlength']) {
                <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <p class="error-msg">{{ errorMessage }}</p>
            }

            <button mat-raised-button color="primary" class="full-width submit-btn" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Criando...' : 'Criar conta' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p class="login-link">Já tem conta? <a routerLink="/login">Entrar</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px); padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; padding: 16px; }
    mat-card-header { margin-bottom: 24px; }
    .google-btn { width: 100%; display: flex; align-items: center; gap: 12px; justify-content: center; padding: 8px; }
    .divider { position: relative; margin: 24px 0; }
    .divider-text { background: white; padding: 0 12px; color: #999; font-size: 0.85rem; }
    .full-width { width: 100%; }
    mat-form-field { margin-bottom: 8px; }
    .submit-btn { margin-top: 16px; padding: 12px; }
    .error-msg { color: #d32f2f; font-size: 0.85rem; }
    .login-link { text-align: center; font-size: 0.9rem; }
    .login-link a { color: #6750A4; text-decoration: none; font-weight: 500; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  hidePassword = true;
  loading = false;
  errorMessage = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)], [this.usernameValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return control.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => from(this.profileService.isUsernameAvailable(value))),
        map(available => available ? null : { taken: true }),
        first()
      );
    };
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    try {
      const { username, email, password } = this.form.value;
      await this.auth.signUpWithEmail(email!, password!, username!);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Erro ao criar conta';
    } finally {
      this.loading = false;
    }
  }

  signInWithGoogle(): void {
    this.auth.signInWithGoogle();
  }
}
