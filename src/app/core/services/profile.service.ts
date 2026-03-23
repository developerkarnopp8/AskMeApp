import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase.client';
import { Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private supabase = inject(SUPABASE_CLIENT);

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    return !data;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }
}
