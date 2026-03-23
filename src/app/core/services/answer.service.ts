import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class AnswerService {
  private supabase = inject(SUPABASE_CLIENT);

  async submitAnswer(questionId: string, content: string): Promise<void> {
    const { error } = await this.supabase.from('answers').insert({
      question_id: questionId,
      content
    });

    if (error) throw error;
  }

  async deleteAnswer(answerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('answers')
      .delete()
      .eq('id', answerId);

    if (error) throw error;
  }
}
