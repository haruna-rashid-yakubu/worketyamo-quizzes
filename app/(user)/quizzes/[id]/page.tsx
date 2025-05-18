"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Check,
  ArrowLeft,
  Timer,
  CheckCircle2,
  ListChecks,
  Loader2,
  SendHorizonal,
} from "lucide-react";

// Import shadcn components
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface Quiz {
  id: number;
  title: string;
  description: string;
  subject: string;
  timeLimit: number;
  questionCount: number;
  maxScore: number;
  dueDate: string;
  questions: Question[];
}

interface Question {
  id: number;
  text: string;
  type: "multiple-choice" | "checkbox" | "text";
  points: number;
  options?: Option[];
  correctAnswer?: string | string[];
}

interface Option {
  id: string;
  text: string;
}

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.quizz_number as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerWarning, setTimerWarning] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Load quiz data
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Mock quiz data that would normally come from an API
        const mockQuiz: Quiz = {
          id: quizId,
          title: "Biology 101: Cell Structure",
          description:
            "Test your knowledge about cell structures and functions.",
          subject: "Biology",
          timeLimit: 15, // minutes
          questionCount: 5,
          maxScore: 7,
          dueDate: "2025-05-10T23:59:59Z",
          questions: [
            {
              id: 1,
              text: "Which organelle is responsible for protein synthesis in the cell?",
              type: "multiple-choice",
              points: 1,
              options: [
                { id: "a", text: "Mitochondria" },
                { id: "b", text: "Ribosome" },
                { id: "c", text: "Golgi Apparatus" },
                { id: "d", text: "Lysosome" },
              ],
              correctAnswer: "b",
            },
            {
              id: 2,
              text: "Select all structures that are part of the endomembrane system:",
              type: "checkbox",
              points: 2,
              options: [
                { id: "a", text: "Endoplasmic Reticulum" },
                { id: "b", text: "Golgi Apparatus" },
                { id: "c", text: "Mitochondria" },
                { id: "d", text: "Lysosomes" },
                { id: "e", text: "Chloroplasts" },
              ],
              correctAnswer: ["a", "b", "d"],
            },
            {
              id: 3,
              text: "What is the main function of mitochondria in eukaryotic cells?",
              type: "multiple-choice",
              points: 1,
              options: [
                { id: "a", text: "Protein synthesis" },
                { id: "b", text: "Photosynthesis" },
                { id: "c", text: "ATP production (cellular respiration)" },
                { id: "d", text: "Lipid synthesis" },
              ],
              correctAnswer: "c",
            },
            {
              id: 4,
              text: "Briefly explain the process of endocytosis and its importance to cellular function.",
              type: "text",
              points: 2,
            },
            {
              id: 5,
              text: "Which of the following statements about cell membranes are correct?",
              type: "checkbox",
              points: 1,
              options: [
                {
                  id: "a",
                  text: "They are composed primarily of phospholipids",
                },
                { id: "b", text: "They are completely impermeable" },
                { id: "c", text: "They contain embedded proteins" },
                {
                  id: "d",
                  text: "They maintain the same composition in all cell types",
                },
              ],
              correctAnswer: ["a", "c"],
            },
          ],
        };

        setQuiz(mockQuiz);
        setTimeRemaining(mockQuiz.timeLimit * 60); // Convert minutes to seconds
      } catch (err) {
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (!quiz || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 300 && !timerWarning) {
          // 5 minutes warning
          setTimerWarning(true);
        }

        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Navigation
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questionCount - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Answer handling
  const handleMultipleChoiceAnswer = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleCheckboxAnswer = (
    questionId: number,
    optionId: string,
    checked: boolean,
  ) => {
    const currentAnswers = answers[questionId] || [];

    let newAnswers;
    if (checked) {
      newAnswers = [...currentAnswers, optionId];
    } else {
      newAnswers = currentAnswers.filter((id: string) => id !== optionId);
    }

    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleTextAnswer = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  // Flag question
  const toggleFlaggedQuestion = (questionId: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    setIsSubmitting(true);

    // In a real app, we would send the answers to the server here
    setTimeout(() => {
      // Mock submission success
      console.log("Submitting answers:", answers);
      router.push(`/student/quizzes/${quizId}/results`);
    }, 1500);
  };

  // Calculate progress
  const answeredQuestionsCount = Object.keys(answers).length;
  const progressPercentage = quiz
    ? (answeredQuestionsCount / quiz.questionCount) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-slate-500 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Quiz not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/student/quizzes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 py-3 flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 transition"
          onClick={() => router.push("/student/quizzes")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Quiz</span>
        </Button>
        
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center px-3 py-1.5 rounded-full ${
                  timerWarning 
                    ? "bg-red-50 text-red-600 border border-red-200" 
                    : "bg-slate-50 text-slate-700 border border-slate-200"
                } transition-all duration-300`}>
                  <Clock className={`mr-1.5 h-4 w-4 ${timerWarning ? "text-red-500" : ""}`} />
                  <span className={`font-mono font-medium ${timerWarning ? "text-red-600" : ""}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Time remaining</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="ml-2 text-slate-600"
            onClick={() => setSideNavOpen(!sideNavOpen)}
          >
            <ListChecks className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {timerWarning && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Time is running out!</AlertTitle>
            <AlertDescription>
              Less than 5 minutes remaining. Complete your answers soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Main content */}
        <div className="flex gap-6">
          {/* Main quiz area */}
          <div className="flex-1">
            {/* Quiz title and info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">{quiz.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0">
                  {quiz.subject}
                </Badge>
                <span className="text-sm text-slate-500">
                  {quiz.questionCount} questions • {quiz.maxScore} points
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1.5 text-slate-600">
                <span>
                  {answeredQuestionsCount} of {quiz.questionCount} answered
                </span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-1.5 bg-slate-200"
              />
            </div>

            {/* Question card */}
            <Card className="mb-6 border-none shadow-sm overflow-hidden transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium text-slate-800 flex items-center">
                      Question {currentQuestionIndex + 1}
                      <Badge className="ml-2 bg-white text-slate-700 border-slate-200">
                        {currentQuestion.points}{" "}
                        {currentQuestion.points === 1 ? "point" : "points"}
                      </Badge>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {currentQuestion.type === "multiple-choice" &&
                        "Select one answer"}
                      {currentQuestion.type === "checkbox" && "Select all that apply"}
                      {currentQuestion.type === "text" && "Write your answer"}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFlaggedQuestion(currentQuestion.id)}
                          className={`transition-all duration-200 ${
                            flaggedQuestions.has(currentQuestion.id)
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                              : "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                        >
                          <Flag
                            className={`mr-1 h-4 w-4 ${
                              flaggedQuestions.has(currentQuestion.id) ? "fill-amber-200" : ""
                            }`}
                          />
                          {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{flaggedQuestions.has(currentQuestion.id) 
                          ? "Remove flag from this question" 
                          : "Flag this question for review"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <CardContent className="pt-6 pb-4 px-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">
                    {currentQuestion.text}
                  </h3>

                  {currentQuestion.type === "multiple-choice" && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) =>
                        handleMultipleChoiceAnswer(currentQuestion.id, value)
                      }
                      className="space-y-3"
                    >
                      {currentQuestion.options?.map((option) => (
                        <div 
                          key={option.id} 
                          className={`flex items-center space-x-2 p-3 rounded-md border transition-all duration-200 ${
                            answers[currentQuestion.id] === option.id 
                              ? "border-indigo-300 bg-indigo-50" 
                              : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                          }`}
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={`option-${option.id}`}
                            className="text-indigo-600"
                          />
                          <Label
                            htmlFor={`option-${option.id}`}
                            className="cursor-pointer w-full font-normal"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === "checkbox" && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option) => {
                        const currentAnswers = answers[currentQuestion.id] || [];
                        const isSelected = currentAnswers.includes(option.id);
                        
                        return (
                          <div
                            key={option.id}
                            className={`flex items-center space-x-2 p-3 rounded-md border transition-all duration-200 ${
                              isSelected
                                ? "border-indigo-300 bg-indigo-50" 
                                : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                          >
                            <Checkbox
                              id={`option-${option.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleCheckboxAnswer(
                                  currentQuestion.id,
                                  option.id,
                                  !!checked,
                                )
                              }
                              className="text-indigo-600"
                            />
                            <Label
                              htmlFor={`option-${option.id}`}
                              className="cursor-pointer w-full font-normal"
                            >
                              {option.text}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === "text" && (
                    <Textarea
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        handleTextAnswer(currentQuestion.id, e.target.value)
                      }
                      className="min-h-32 border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100 focus:ring-opacity-50"
                    />
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === quiz.questionCount - 1}
                    className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                >
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  Submit Quiz
                </Button>
              </CardFooter>
            </Card>

            {/* Question navigator for smaller screens */}
            <div className="block md:hidden mb-6">
              <h3 className="text-md font-medium mb-3 text-slate-700">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((question, index) => {
                  // Determine status for styling
                  const isCurrent = index === currentQuestionIndex;
                  const isAnswered = !!answers[question.id];
                  const isFlagged = flaggedQuestions.has(question.id);
                  
                  let buttonStyle = "";
                  
                  if (isCurrent) {
                    buttonStyle = "bg-indigo-600 text-white border-transparent ring-2 ring-indigo-200";
                  } else if (isFlagged) {
                    buttonStyle = "bg-amber-50 text-amber-700 border-amber-200";
                  } else if (isAnswered) {
                    buttonStyle = "bg-green-50 text-green-700 border-green-200";
                  } else {
                    buttonStyle = "bg-white text-slate-600 border-slate-200";
                  }

                  return (
                    <Button
                      key={question.id}
                      variant="outline"
                      className={`h-10 w-10 p-0 font-medium relative ${buttonStyle}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                      )}
                      {isAnswered && !isFlagged && (
                        <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side navigator - only for tablet/desktop */}
          <div className={`hidden md:block w-56 transition-opacity ${sideNavOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="sticky top-24 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium mb-3 text-slate-700">Questions</h3>
              <div className="space-y-2">
                {quiz.questions.map((question, index) => {
                  // Determine status for styling
                  const isCurrent = index === currentQuestionIndex;
                  const isAnswered = !!answers[question.id];
                  const isFlagged = flaggedQuestions.has(question.id);
                  
                  let buttonStyle = "";
                  
                  if (isCurrent) {
                    buttonStyle = "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium";
                  } else if (isFlagged) {
                    buttonStyle = "bg-amber-50 border-amber-200 text-amber-700";
                  } else if (isAnswered) {
                    buttonStyle = "bg-green-50 border-green-200 text-green-700";
                  } else {
                    buttonStyle = "bg-white border-slate-200 text-slate-600";
                  }

                  return (
                    <button
                      key={question.id}
                      className={`flex items-center w-full py-2 px-3 rounded-md border text-left text-sm transition-all ${buttonStyle}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      <span className="mr-3 flex-none">{index + 1}</span>
                      <span className="truncate flex-1">
                        {question.type === "multiple-choice" && "Multiple choice"}
                        {question.type === "checkbox" && "Multiple select"}
                        {question.type === "text" && "Short answer"}
                      </span>
                      {isFlagged && <Flag className="h-3.5 w-3.5 ml-1.5 flex-none text-amber-500" />}
                      {isAnswered && !isFlagged && <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 flex-none text-green-500" />}
                    </button>
                  );
                })}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2 bg-indigo-500"></div>
                  <span>Current question</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2 bg-green-500"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2 bg-amber-500"></div>
                  <span>Flagged for review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your quiz? You can't change your
              answers after submission.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <h4 className="font-medium mb-3 text-slate-800">Quiz Summary</h4>
            <div className="text-sm space-y-2 rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Questions:</span>
                <span className="font-medium">{quiz.questionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Answered Questions:</span>
                <span className="font-medium text-green-600">{answeredQuestionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Unanswered Questions:</span>
                <span className="font-medium text-amber-600">
                  {quiz.questionCount - answeredQuestionsCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Flagged Questions:</span>
                <span className="font-medium">{flaggedQuestions.size}</span>
              </div>
            </div>

            {quiz.questionCount - answeredQuestionsCount > 0 && (
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-700 text-sm font-medium">Warning</AlertTitle>
                <AlertDescription className="text-amber-700 text-sm">
                  You have {quiz.questionCount - answeredQuestionsCount}{" "}
                  unanswered questions. Unanswered questions will be marked as
                  incorrect.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              disabled={isSubmitting}
              className="border-slate-200"
            >
              Return to Quiz
            </Button>
            <Button 
              onClick={handleSubmitQuiz} 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Quiz
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


