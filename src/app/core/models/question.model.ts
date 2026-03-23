export interface Question {
  id: string;
  recipient_id: string;
  sender_name: string | null;
  content: string;
  created_at: string;
  answer?: Answer;
}

export interface Answer {
  id: string;
  question_id: string;
  content: string;
  created_at: string;
}

export interface AnsweredQuestion {
  id: string;
  content: string;
  created_at: string;
  questions: {
    id: string;
    content: string;
    sender_name: string | null;
    created_at: string;
    recipient_id: string;
  };
}
