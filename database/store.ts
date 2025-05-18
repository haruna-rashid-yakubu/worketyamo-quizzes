// src/database/store.ts

import { createClient } from '@supabase/supabase-js';
import { 
  NewQuizData, 
  NewQuestion,
  Subject,
  Quiz,
  Question,
  Option,
  Answer
} from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get all subjects
export async function getSubjects(): Promise<Subject[] | null> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching subjects:', error);
    return null;
  }
  
  return data;
}

// Create a new quiz with questions
export async function createQuiz(
  quizData: NewQuizData,
  questions: NewQuestion[]
) {
  // Start a transaction
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert([quizData])
    .select()
    .single();
    
  if (quizError) {
    console.error('Error creating quiz:', quizError);
    return { error: quizError };
  }
  
  // For each question, create the question, options, and answer
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    // Create question
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert([{
        quiz_id: quiz.id,
        text: question.text,
        type: question.type,
        points: question.points,
        order_num: i + 1
      }])
      .select()
      .single();
      
    if (questionError) {
      console.error('Error creating question:', questionError);
      return { error: questionError };
    }
    
    // Create options if needed
    if (question.type !== 'text' && question.options && question.options.length > 0) {
      const options = question.options.map(opt => ({
        question_id: questionData.id,
        text: opt.text,
        option_id: opt.id
      }));
      
      const { error: optionsError } = await supabase
        .from('options')
        .insert(options);
        
      if (optionsError) {
        console.error('Error creating options:', optionsError);
        return { error: optionsError };
      }
    }
    
    // Create answer
    const { error: answerError } = await supabase
      .from('answers')
      .insert([{
        question_id: questionData.id,
        correct_answer: question.correctAnswer
      }]);
      
    if (answerError) {
      console.error('Error creating answer:', answerError);
      return { error: answerError };
    }
  }
  
  return { data: quiz };
}

// Get a quiz with all questions, options, and correct answers
export async function getQuiz(quizId: string) {
  // Get quiz details
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select(`
      *,
      subjects(name)
    `)
    .eq('id', quizId)
    .single();
    
  if (quizError) {
    console.error('Error fetching quiz:', quizError);
    return { error: quizError };
  }
  
  // Get all questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_num');
    
  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return { error: questionsError };
  }
  
  // For each question, get options and correct answers
  const fullQuestions = await Promise.all(questions.map(async (question) => {
    // Get options if not a text question
    let options = [];
    if (question.type !== 'text') {
      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('question_id', question.id)
        .order('option_id');
        
      if (optionsError) {
        console.error('Error fetching options:', optionsError);
        return question;
      }
      
      options = optionsData;
    }
    
    // Get correct answer
    const { data: answerData, error: answerError } = await supabase
      .from('answers')
      .select('correct_answer')
      .eq('question_id', question.id)
      .single();
      
    if (answerError) {
      console.error('Error fetching answer:', answerError);
      return { ...question, options };
    }
    
    return {
      ...question,
      options,
      correctAnswer: answerData.correct_answer
    };
  }));
  
  return {
    data: {
      ...quiz,
      questions: fullQuestions
    }
  };
}

// Start a quiz attempt
export async function startQuizAttempt(quizId: string, userId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([{
      quiz_id: quizId,
      user_id: userId,
      is_complete: false
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error starting quiz attempt:', error);
    return { error };
  }
  
  return { data };
}

// Submit an answer for a question
export async function submitAnswer(
  attemptId: string,
  questionId: string,
  userAnswer: string | string[]
) {
  // Get the correct answer for this question
  const { data: correctAnswerData, error: correctAnswerError } = await supabase
    .from('answers')
    .select('correct_answer')
    .eq('question_id', questionId)
    .single();
    
  if (correctAnswerError) {
    console.error('Error fetching correct answer:', correctAnswerError);
    return { error: correctAnswerError };
  }
  
  // Get question info for points
  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .select('points, type')
    .eq('id', questionId)
    .single();
    
  if (questionError) {
    console.error('Error fetching question data:', questionError);
    return { error: questionError };
  }
  
  // Determine if the answer is correct
  let isCorrect = false;
  const correctAnswer = correctAnswerData.correct_answer;
  
  if (questionData.type === 'text') {
    // Case-insensitive comparison for text answers
    isCorrect = String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
  } else if (questionData.type === 'multiple-choice') {
    // Simple comparison for single select
    isCorrect = userAnswer === correctAnswer;
  } else if (questionData.type === 'checkbox') {
    // For checkbox, need to compare arrays
    const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    
    // Check if arrays have same length and all items match
    isCorrect = 
      userAnswerArray.length === correctAnswerArray.length &&
      userAnswerArray.every(a => correctAnswerArray.includes(a));
  }
  
  // Calculate points earned
  const pointsEarned = isCorrect ? questionData.points : 0;
  
  // Submit the answer
  const { data, error } = await supabase
    .from('user_answers')
    .insert([{
      attempt_id: attemptId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      points_earned: pointsEarned
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error submitting answer:', error);
    return { error };
  }
  
  return { data };
}

// Complete a quiz attempt
export async function completeQuizAttempt(attemptId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .update({ is_complete: true })
    .eq('id', attemptId)
    .select()
    .single();
    
  if (error) {
    console.error('Error completing quiz attempt:', error);
    return { error };
  }
  
  return { data };
}

// Get all quizzes created by a user
export async function getUserQuizzes(userId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      subjects(name)
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching user quizzes:', error);
    return { error };
  }
  
  return { data };
}

// Get all public quizzes
export async function getPublicQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      subjects(name),
      users(full_name)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching public quizzes:', error);
    return { error };
  }
  
  return { data };
}

// Get quiz attempts for a specific quiz
export async function getQuizAttempts(quizId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      users(full_name, email)
    `)
    .eq('quiz_id', quizId)
    .order('start_time', { ascending: false });
    
  if (error) {
    console.error('Error fetching quiz attempts:', error);
    return { error };
  }
  
  return { data };
}

// Get detailed results for a specific attempt
export async function getAttemptResults(attemptId: string) {
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes(title, description)
    `)
    .eq('id', attemptId)
    .single();
    
  if (attemptError) {
    console.error('Error fetching attempt:', attemptError);
    return { error: attemptError };
  }
  
  const { data: answers, error: answersError } = await supabase
    .from('user_answers')
    .select(`
      *,
      questions(text, type, points)
    `)
    .eq('attempt_id', attemptId);
    
  if (answersError) {
    console.error('Error fetching user answers:', answersError);
    return { error: answersError };
  }
  
  // For each answer, get the correct answer and options
  const detailedAnswers = await Promise.all(answers.map(async (answer) => {
    // Get correct answer
    const { data: correctAnswer, error: correctAnswerError } = await supabase
      .from('answers')
      .select('correct_answer')
      .eq('question_id', answer.question_id)
      .single();
      
    if (correctAnswerError) {
      console.error('Error fetching correct answer:', correctAnswerError);
      return answer;
    }
    
    // Get options if not a text question
    let options = [];
    if (answer.questions.type !== 'text') {
      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('question_id', answer.question_id);
        
      if (optionsError) {
        console.error('Error fetching options:', optionsError);
        return { ...answer, correctAnswer: correctAnswer.correct_answer };
      }
      
      options = optionsData;
    }
    
    return {
      ...answer,
      correctAnswer: correctAnswer.correct_answer,
      options
    };
  }));
  
  return {
    data: {
      attempt,
      answers: detailedAnswers
    }
  };
}