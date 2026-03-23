import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase.client';
import { AnsweredQuestion, Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private supabase = inject(SUPABASE_CLIENT);

  async submitQuestion(recipientId: string, content: string, senderName?: string): Promise<void> {
    const { error } = await this.supabase.from('questions').insert({
      recipient_id: recipientId,
      content,
      sender_name: senderName || null
    });

    if (error) throw error;
  }

  async getQuestionsForDashboard(profileId: string): Promise<Question[]> {
    const { data: questions, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('recipient_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!questions?.length) return [];

    const questionIds = questions.map((q: any) => q.id);
    const { data: answers } = await this.supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds);

    const answersMap = new Map((answers ?? []).map((a: any) => [a.question_id, a]));

    return questions.map((q: any) => ({
      ...q,
      answer: answersMap.get(q.id) ?? null
    }));
  }

  async getAnsweredQuestionsForProfile(profileId: string): Promise<AnsweredQuestion[]> {
    const { data, error } = await this.supabase
      .rpc('get_answered_questions', { profile_id: profileId });

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      id: row.answer_id,
      content: row.answer_content,
      created_at: row.answer_created_at,
      questions: {
        id: row.question_id,
        content: row.question_content,
        sender_name: row.sender_name,
        created_at: row.question_created_at
      }
    })) as AnsweredQuestion[];
  }
}
