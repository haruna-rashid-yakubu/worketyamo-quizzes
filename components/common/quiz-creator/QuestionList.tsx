import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionForm } from "./QuestionForm";

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

interface QuestionListProps {
  questions: Question[];
  onAddQuestion: () => void;
  onRemoveQuestion: (id: number) => void;
  onUpdateQuestionText: (id: number, text: string) => void;
  onUpdateQuestionType: (id: number, type: "multiple-choice" | "checkbox" | "text") => void;
  onUpdateOptionText: (questionId: number, optionId: string, text: string) => void;
  onUpdateCorrectAnswer: (questionId: number, optionId: string) => void;
  onUpdateQuestionPoints: (questionId: number, points: number) => void;
  onAddOption: (questionId: number) => void;
  onRemoveOption: (questionId: number, optionId: string) => void;
}

export function QuestionList({
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestionText,
  onUpdateQuestionType,
  onUpdateOptionText,
  onUpdateCorrectAnswer,
  onUpdateQuestionPoints,
  onAddOption,
  onRemoveOption,
}: QuestionListProps) {
  const calculateMaxScore = (): number => {
    return questions.reduce((total, question) => total + question.points, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Questions</h3>
          <p className="text-sm text-gray-500">
            Total points: {calculateMaxScore()}
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Total questions: {questions.length}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question) => (
          <QuestionForm
            key={question.id}
            question={question}
            questionNumber={questions.findIndex((q) => q.id === question.id) + 1}
            onRemove={onRemoveQuestion}
            onUpdateText={onUpdateQuestionText}
            onUpdateType={onUpdateQuestionType}
            onUpdateOptionText={onUpdateOptionText}
            onUpdateCorrectAnswer={onUpdateCorrectAnswer}
            onUpdatePoints={onUpdateQuestionPoints}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
            totalQuestions={questions.length}
          />
        ))}
      </div>

      <Button
        onClick={onAddQuestion}
        variant="outline"
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>
    </div>
  );
} 