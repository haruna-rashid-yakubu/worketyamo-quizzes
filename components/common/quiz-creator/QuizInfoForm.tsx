import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Subject {
  id: string;
  name: string;
}

interface QuizInfoFormProps {
  quizTitle: string;
  setQuizTitle: (value: string) => void;
  quizDescription: string;
  setQuizDescription: (value: string) => void;
  subjectId: string;
  setSubjectId: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  timeLimit: string;
  setTimeLimit: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  subjects: Subject[];
  onContinue: () => void;
}

export function QuizInfoForm({
  quizTitle,
  setQuizTitle,
  quizDescription,
  setQuizDescription,
  subjectId,
  setSubjectId,
  subject,
  setSubject,
  timeLimit,
  setTimeLimit,
  dueDate,
  setDueDate,
  isPublic,
  setIsPublic,
  subjects,
  onContinue,
}: QuizInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quiz-title">Quiz Title</Label>
        <Input
          id="quiz-title"
          placeholder="Enter quiz title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={subjectId}
          onValueChange={(value) => {
            const selectedSubject = subjects.find((s) => s.id === value);
            if (selectedSubject) {
              setSubjectId(value);
              setSubject(selectedSubject.name);
            }
          }}
        >
          <SelectTrigger id="subject" className="w-full">
            <SelectValue placeholder="Select a subject">
              {subject ? subject : "Select a subject"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {subjects.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quiz-description">Description</Label>
        <Textarea
          id="quiz-description"
          placeholder="Enter quiz description"
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time-limit">Time Limit (minutes)</Label>
          <Input
            id="time-limit"
            type="number"
            min="0"
            placeholder="No time limit"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date</Label>
          <div className="flex">
            <Input
              id="due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="public-quiz"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="public-quiz">
            Make quiz available to all teachers
          </Label>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onContinue}
          disabled={!quizTitle.trim() || !subjectId}
        >
          Continue to Questions
        </Button>
      </div>
    </div>
  );
} 