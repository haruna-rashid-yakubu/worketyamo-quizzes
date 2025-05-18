import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Create a function to get the Supabase client with the correct configuration
export function getSupabaseClient(request?: NextRequest, response?: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request?.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (request && response) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          }
        },
        remove(name: string, options: CookieOptions) {
          if (request && response) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          }
        },
      },
    }
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = getSupabaseClient(request, response);
  await supabase.auth.getUser();

  return response;
}

/**
 * Get all subjects from the database
 * @returns {Promise<Array<{id: string, name: string}>>} Array of subject objects
 */
export async function getSubjects() {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getSubjects:', error);
    throw error;
  }
}

/**
 * Create a new quiz with associated questions
 * @param {Object} quizData - Basic quiz information
 * @param {string} quizData.title - Quiz title
 * @param {string} quizData.description - Quiz description
 * @param {string} quizData.subject_id - ID of the subject
 * @param {string} quizData.creator_id - ID of the user creating the quiz
 * @param {number} quizData.time_limit - Time limit in minutes (0 for no limit)
 * @param {string} quizData.due_date - Due date in ISO format
 * @param {boolean} quizData.is_public - Whether the quiz is public
 * @param {Array<Object>} questions - Questions data
 * @returns {Promise<Object>} Created quiz data
 */
export async function createQuiz(quizData, questions) {
  const supabase = getSupabaseClient();
  
  try {
    // Start a Supabase transaction
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          title: quizData.title,
          description: quizData.description,
          subject_id: quizData.subject_id,
          creator_id: quizData.creator_id,
          time_limit: quizData.time_limit,
          due_date: quizData.due_date,
          is_public: quizData.is_public,
        },
      ])
      .select()
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
      return { error: quizError };
    }

    // Now add the questions
    const questionPromises = questions.map(async (question, index) => {
      // First create the question
      const { data: createdQuestion, error: questionError } = await supabase
        .from('quiz_questions')
        .insert([
          {
            quiz_id: quiz.id,
            text: question.text,
            type: question.type,
            points: question.points,
            question_order: index + 1,
          },
        ])
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        return { error: questionError };
      }

      // Then handle the options (for multiple-choice and checkbox questions)
      if (question.type === 'multiple-choice' || question.type === 'checkbox') {
        const optionsData = question.options.map((option, optIndex) => ({
          question_id: createdQuestion.id,
          text: option.text,
          option_id: option.id,
          option_order: optIndex + 1,
        }));

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsData);

        if (optionsError) {
          console.error('Error creating options:', optionsError);
          return { error: optionsError };
        }
      }

      // Finally, store the correct answer(s)
      let correctAnswerData;
      if (question.type === 'checkbox' && Array.isArray(question.correctAnswer)) {
        // For checkbox, we store multiple correct answers
        correctAnswerData = question.correctAnswer.map((answerOptionId) => ({
          question_id: createdQuestion.id,
          option_id: answerOptionId,
        }));
      } else if (question.type === 'multiple-choice') {
        // For multiple-choice, we store a single correct answer
        correctAnswerData = [
          {
            question_id: createdQuestion.id,
            option_id: question.correctAnswer,
          },
        ];
      } else if (question.type === 'text') {
        // For text answers, we store the text directly
        correctAnswerData = [
          {
            question_id: createdQuestion.id,
            text_answer: question.correctAnswer,
          },
        ];
      }

      if (correctAnswerData) {
        const { error: answersError } = await supabase
          .from('correct_answers')
          .insert(correctAnswerData);

        if (answersError) {
          console.error('Error creating correct answers:', answersError);
          return { error: answersError };
        }
      }

      return createdQuestion;
    });

    // Wait for all questions to be created
    await Promise.all(questionPromises);

    return { data: quiz };
  } catch (error) {
    console.error('Error in createQuiz:', error);
    return { error };
  }
}

/**
 * Get quiz details with all associated questions and options
 * @param {string} quizId - ID of the quiz
 * @returns {Promise<Object>} Quiz with questions and options
 */
export async function getQuizWithQuestions(quizId) {
  const supabase = getSupabaseClient();
  
  try {
    // Fetch the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        subject:subjects(name)
      `)
      .eq('id', quizId)
      .single();

    if (quizError) {
      console.error('Error fetching quiz:', quizError);
      return { error: quizError };
    }

    // Fetch the questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('question_order');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return { error: questionsError };
    }

    // Fetch options and correct answers for each question
    const enrichedQuestions = await Promise.all(
      questions.map(async (question) => {
        // Get options if not a text question
        let options = [];
        if (question.type !== 'text') {
          const { data: optionsData, error: optionsError } = await supabase
            .from('question_options')
            .select('*')
            .eq('question_id', question.id)
            .order('option_order');

          if (optionsError) {
            console.error('Error fetching options:', optionsError);
            return question;
          }

          options = optionsData;
        }

        // Get correct answers
        const { data: correctAnswers, error: answersError } = await supabase
          .from('correct_answers')
          .select('*')
          .eq('question_id', question.id);

        if (answersError) {
          console.error('Error fetching correct answers:', answersError);
          return { ...question, options };
        }

        // Format the correct answer based on question type
        let formattedCorrectAnswer;
        if (question.type === 'checkbox') {
          formattedCorrectAnswer = correctAnswers.map((answer) => answer.option_id);
        } else if (question.type === 'multiple-choice') {
          formattedCorrectAnswer = correctAnswers[0]?.option_id || '';
        } else {
          formattedCorrectAnswer = correctAnswers[0]?.text_answer || '';
        }

        return {
          ...question,
          options,
          correctAnswer: formattedCorrectAnswer,
        };
      })
    );

    return { 
      data: {
        ...quiz,
        questions: enrichedQuestions 
      }
    };
  } catch (error) {
    console.error('Error in getQuizWithQuestions:', error);
    return { error };
  }
}

/**
 * Get all quizzes created by the specified user
 * @param {string} userId - ID of the creator
 * @returns {Promise<Array<Object>>} Array of quiz objects
 */
export async function getUserQuizzes(userId) {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        subject:subjects(name)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user quizzes:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserQuizzes:', error);
    throw error;
  }
}

/**
 * Delete a quiz and all associated questions, options, and answers
 * @param {string} quizId - ID of the quiz to delete
 * @returns {Promise<Object>} Result of the operation
 */
export async function deleteQuiz(quizId) {
  const supabase = getSupabaseClient();
  
  try {
    // Get questions to delete associated options and answers
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id')
      .eq('quiz_id', quizId);

    if (questionsError) {
      console.error('Error fetching questions for deletion:', questionsError);
      return { error: questionsError };
    }

    const questionIds = questions.map(q => q.id);

    // Delete correct answers
    if (questionIds.length > 0) {
      const { error: answersError } = await supabase
        .from('correct_answers')
        .delete()
        .in('question_id', questionIds);

      if (answersError) {
        console.error('Error deleting correct answers:', answersError);
        return { error: answersError };
      }

      // Delete options
      const { error: optionsError } = await supabase
        .from('question_options')
        .delete()
        .in('question_id', questionIds);

      if (optionsError) {
        console.error('Error deleting options:', optionsError);
        return { error: optionsError };
      }
    }

    // Delete questions
    const { error: deleteQuestionsError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);

    if (deleteQuestionsError) {
      console.error('Error deleting questions:', deleteQuestionsError);
      return { error: deleteQuestionsError };
    }

    // Delete the quiz
    const { error: deleteQuizError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (deleteQuizError) {
      console.error('Error deleting quiz:', deleteQuizError);
      return { error: deleteQuizError };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    return { error };
  }
}