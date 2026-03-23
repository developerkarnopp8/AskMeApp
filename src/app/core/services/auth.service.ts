import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SUPABASE_CLIENT } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SUPABASE_CLIENT);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSubject.next(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async signUpWithEmail(email: string, password: string, username: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) throw error;

    if (data.user) {
      await this.supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        display_name: username
      });
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.router.navigate(['/']);
  }
}
