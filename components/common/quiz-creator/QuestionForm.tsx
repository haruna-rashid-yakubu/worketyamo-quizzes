import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

interface QuestionFormProps {
  question: Question;
  questionNumber: number;
  onRemove: (id: number) => void;
  onUpdateText: (id: number, text: string) => void;
  onUpdateType: (id: number, type: "multiple-choice" | "checkbox" | "text") => void;
  onUpdateOptionText: (questionId: number, optionId: string, text: string) => void;
  onUpdateCorrectAnswer: (questionId: number, optionId: string) => void;
  onUpdatePoints: (questionId: number, points: number) => void;
  onAddOption: (questionId: number) => void;
  onRemoveOption: (questionId: number, optionId: string) => void;
  totalQuestions: number;
}

export function QuestionForm({
  question,
  questionNumber,
  onRemove,
  onUpdateText,
  onUpdateType,
  onUpdateOptionText,
  onUpdateCorrectAnswer,
  onUpdatePoints,
  onAddOption,
  onRemoveOption,
  totalQuestions,
}: QuestionFormProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-md font-medium">
            Question {questionNumber}
          </CardTitle>
          <CardDescription>Configure your question details</CardDescription>
        </div>
        {totalQuestions > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
          <Textarea
            id={`question-${question.id}`}
            placeholder="Enter your question..."
            value={question.text}
            onChange={(e) => onUpdateText(question.id, e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
          <Select
            value={question.type}
            onValueChange={(value) => onUpdateType(question.id, value as "multiple-choice" | "checkbox" | "text")}
          >
            <SelectTrigger id={`question-type-${question.id}`}>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="checkbox">Multiple Select (Checkbox)</SelectItem>
              <SelectItem value="text">Text Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(question.type === "multiple-choice" || question.type === "checkbox") && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Answer Options</Label>
              {question.options.length < 8 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddOption(question.id)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Option
                </Button>
              )}
            </div>

            {question.type === "multiple-choice" && (
              <RadioGroup
                value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                onValueChange={(value) => onUpdateCorrectAnswer(question.id, value)}
                className="space-y-2"
              >
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.id}
                      id={`option-${question.id}-${option.id}`}
                    />
                    <div className="flex flex-grow items-center">
                      <Input
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        value={option.text}
                        onChange={(e) => onUpdateOptionText(question.id, option.id, e.target.value)}
                        className="flex-grow"
                      />
                      {question.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveOption(question.id, option.id)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === "checkbox" && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${question.id}-${option.id}`}
                      checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option.id)}
                      onCheckedChange={() => onUpdateCorrectAnswer(question.id, option.id)}
                    />
                    <div className="flex flex-grow items-center">
                      <Input
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        value={option.text}
                        onChange={(e) => onUpdateOptionText(question.id, option.id, e.target.value)}
                        className="flex-grow"
                      />
                      {question.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveOption(question.id, option.id)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {question.type === "text" && (
          <div className="space-y-2">
            <Label htmlFor={`correct-answer-${question.id}`}>Correct Answer</Label>
            <Textarea
              id={`correct-answer-${question.id}`}
              placeholder="Enter the correct answer..."
              value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
              onChange={(e) => onUpdateCorrectAnswer(question.id, e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`points-${question.id}`}>Points</Label>
          <Input
            id={`points-${question.id}`}
            type="number"
            min="1"
            placeholder="1"
            value={question.points}
            onChange={(e) => onUpdatePoints(question.id, parseInt(e.target.value) || 1)}
            className="w-24"
          />
        </div>
      </CardContent>
    </Card>
  );
} 