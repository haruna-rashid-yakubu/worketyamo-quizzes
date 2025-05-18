// Type definitions for use in your application

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Subject {
    id: string;
    name: string;
    description?: string;
    created_at: string;
  }
  
  export interface Quiz {
    id: string;
    title: string;
    description?: string;
    subject_id: string;
    creator_id: string;
    time_limit: number;
    due_date?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export type QuestionType = 'multiple-choice' | 'checkbox' | 'text';
  
  export interface Question {
    id: string;
    quiz_id: string;
    text: string;
    type: QuestionType;
    points: number;
    order_num: number;
    created_at: string;
  }
  
  export interface Option {
    id: string;
    question_id: string;
    text: string;
    option_id: string;
    created_at: string;
  }
  
  export interface Answer {
    id: string;
    question_id: string;
    correct_answer: string | string[];
    created_at: string;
  }
  
  export interface QuizAttempt {
    id: string;
    quiz_id: string;
    user_id: string;
    start_time: string;
    end_time?: string;
    score?: number;
    max_score?: number;
    is_complete: boolean;
  }
  
  export interface UserAnswer {
    id: string;
    attempt_id: string;
    question_id: string;
    user_answer: string | string[];
    is_correct?: boolean;
    points_earned: number;
    created_at: string;
  }
  
  // For creating new quiz
  export interface NewQuizData {
    title: string;
    description?: string;
    subject_id: string;
    creator_id: string;
    time_limit?: number;
    due_date?: string;
    is_public: boolean;
  }
  
  export interface NewQuestion {
    text: string;
    type: QuestionType;
    points: number;
    options: { id: string; text: string }[];
    correctAnswer: string | string[];
  }