"use client";
import { useState, useEffect } from "react";
import { Save, FileQuestion } from "lucide-react";

// Import supabase functions
import { createQuiz, getSubjects } from "@/utils/supabase/middleware";

// Import shadcn components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizInfoForm } from "./QuizInfoForm";
import { QuestionList } from "./QuestionList";

interface Subject {
  id: string;
  name: string;
}

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  type: "multiple-choice" | "checkbox" | "text";
  points: number;
  options: Option[];
  correctAnswer: string | string[];
}

// Props interface for our client component
interface EnhancedQuizCreatorProps {
  userId: string | null;
}

// Client component that uses hooks
export function EnhancedQuizCreatorClient({ userId }: EnhancedQuizCreatorProps) {
  // State for quiz info
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // State for UI management
  const [activeTab, setActiveTab] = useState("quiz-info");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for data from Supabase
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // State for questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "",
      type: "multiple-choice",
      points: 1,
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "a",
    },
  ]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsData = await getSubjects();
        if (subjectsData && Array.isArray(subjectsData)) {
          setSubjects(subjectsData);
          
          if (subjectsData.length > 0 && !subjectId) {
            const defaultSubject = subjectsData[0];
            setSubjectId(defaultSubject.id);
            setSubject(defaultSubject.name);
          }
        } else {
          console.error("Invalid subjects data received:", subjectsData);
          setError("Failed to load subjects");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data");
      }
    };

    fetchData();
  }, []);

  const addQuestion = () => {
    const newId = questions.length + 1;
    const newQuestion: Question = {
      id: newId,
      text: "",
      type: "multiple-choice",
      points: 1,
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "a",
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, text } : q)),
    );
  };

  const updateQuestionType = (id: number, type: "multiple-choice" | "checkbox" | "text") => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          let newOptions: Option[] = [];
          let newCorrectAnswer: string | string[] = "";

          if (type === "multiple-choice") {
            newOptions = [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
              { id: "d", text: "" },
            ];
            newCorrectAnswer = "a";
          } else if (type === "checkbox") {
            newOptions = [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
              { id: "d", text: "" },
            ];
            newCorrectAnswer = [];
          } else if (type === "text") {
            newOptions = [];
            newCorrectAnswer = "";
          }

          return {
            ...q,
            type,
            options: newOptions,
            correctAnswer: newCorrectAnswer,
          };
        }
        return q;
      }),
    );
  };

  const updateOptionText = (questionId: number, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, text } : opt,
            ),
          };
        }
        return q;
      }),
    );
  };

  const updateCorrectAnswer = (questionId: number, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          if (q.type === "checkbox") {
            const currentAnswers = Array.isArray(q.correctAnswer)
              ? q.correctAnswer
              : [];
            const newAnswers = currentAnswers.includes(optionId)
              ? currentAnswers.filter((id) => id !== optionId)
              : [...currentAnswers, optionId];
            return { ...q, correctAnswer: newAnswers };
          } else {
            return { ...q, correctAnswer: optionId };
          }
        }
        return q;
      }),
    );
  };

  const updateQuestionPoints = (questionId: number, points: number) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, points } : q)),
    );
  };

  const addOption = (questionId: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const optionIds = q.options.map((o) => o.id);
          const alphabet = "abcdefghijklmnopqrstuvwxyz";
          let nextOptionId = "";

          for (let i = 0; i < alphabet.length; i++) {
            if (!optionIds.includes(alphabet[i])) {
              nextOptionId = alphabet[i];
              break;
            }
          }

          if (!nextOptionId) {
            nextOptionId = `option_${Math.random().toString(36).substring(2, 9)}`;
          }

          return {
            ...q,
            options: [...q.options, { id: nextOptionId, text: "" }],
          };
        }
        return q;
      }),
    );
  };

  const removeOption = (questionId: number, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options.length > 2) {
          const isRemovingCorrect = q.correctAnswer === optionId;
          let updatedOptions = q.options.filter((o) => o.id !== optionId);
          let updatedCorrectAnswer = q.correctAnswer;

          if (
            q.type === "multiple-choice" &&
            isRemovingCorrect &&
            updatedOptions.length > 0
          ) {
            updatedCorrectAnswer = updatedOptions[0].id;
          }

          if (q.type === "checkbox" && Array.isArray(updatedCorrectAnswer)) {
            updatedCorrectAnswer = updatedCorrectAnswer.filter(
              (id) => id !== optionId,
            );
            if (
              updatedCorrectAnswer.length === 0 &&
              updatedOptions.length > 0
            ) {
              updatedCorrectAnswer = [updatedOptions[0].id];
            }
          }

          return {
            ...q,
            options: updatedOptions,
            correctAnswer: updatedCorrectAnswer,
          };
        }
        return q;
      }),
    );
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("You must be logged in to create a quiz");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const quizData = {
        title: quizTitle,
        description: quizDescription,
        subject_id: subjectId,
        creator_id: userId,
        time_limit: parseInt(timeLimit) || 0,
        due_date: dueDate || new Date().toISOString().split("T")[0],
        is_public: isPublic,
      };

      const formattedQuestions = questions.map((q) => ({
        text: q.text,
        type: q.type,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));

      const result = await createQuiz(quizData, formattedQuestions);

      if (result.error) {
        setError(result.error.message || "Failed to create quiz");
        return;
      }

      if (!result.data) {
        setError("Failed to create quiz: No data returned");
        return;
      }

      setSuccess("Quiz created successfully!");
      setSubmitted(true);

      setTimeout(() => {
        setQuizTitle("");
        setQuizDescription("");
        setTimeLimit("");
        setDueDate("");
        setIsPublic(false);
        setQuestions([
          {
            id: 1,
            text: "",
            type: "multiple-choice",
            points: 1,
            options: [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
              { id: "d", text: "" },
            ],
            correctAnswer: "a",
          },
        ]);
        setActiveTab("quiz-info");
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = () => {
    if (!quizTitle.trim() || !subjectId || !subject) return true;

    for (const question of questions) {
      if (!question.text.trim()) return true;

      if (question.type === "multiple-choice" || question.type === "checkbox") {
        for (const option of question.options) {
          if (!option.text.trim())
            return true;
        }

        if (
          question.type === "checkbox" &&
          (!Array.isArray(question.correctAnswer) ||
            question.correctAnswer.length === 0)
        ) {
          return true;
        }
      } else if (question.type === "text" && !question.correctAnswer) {
        return true;
      }
    }

    return false;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Quiz</CardTitle>
          <CardDescription>
            Design a new quiz for your class or training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quiz-info">Quiz Info</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="quiz-info" className="space-y-4 mt-4">
              <QuizInfoForm
                quizTitle={quizTitle}
                setQuizTitle={setQuizTitle}
                quizDescription={quizDescription}
                setQuizDescription={setQuizDescription}
                subjectId={subjectId}
                setSubjectId={setSubjectId}
                subject={subject}
                setSubject={setSubject}
                timeLimit={timeLimit}
                setTimeLimit={setTimeLimit}
                dueDate={dueDate}
                setDueDate={setDueDate}
                isPublic={isPublic}
                setIsPublic={setIsPublic}
                subjects={subjects}
                onContinue={() => setActiveTab("questions")}
              />
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 mt-4">
              <QuestionList
                questions={questions}
                onAddQuestion={addQuestion}
                onRemoveQuestion={removeQuestion}
                onUpdateQuestionText={updateQuestionText}
                onUpdateQuestionType={updateQuestionType}
                onUpdateOptionText={updateOptionText}
                onUpdateCorrectAnswer={updateCorrectAnswer}
                onUpdateQuestionPoints={updateQuestionPoints}
                onAddOption={addOption}
                onRemoveOption={removeOption}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveTab("quiz-info")}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled() || loading}
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Quiz
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {submitted && success && (
        <Alert className="bg-green-50 border-green-400">
          <FileQuestion className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

