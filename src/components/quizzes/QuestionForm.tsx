import { useState } from "react";
import Input from "../ui/Input"; // Updated Import Path
import Button from "../ui/Button"; // Updated Import Path

interface QuestionFormProps {
  addQuestion: (question: { text: string }) => void; // Ensure correct type
}

const QuestionForm: React.FC<QuestionFormProps> = ({ addQuestion }) => {
  const [question, setQuestion] = useState<string>("");

  const handleAdd = () => {
    if (question.trim()) {
      addQuestion({ text: question }); // Now properly typed
      setQuestion("");
    }
  };

  return (
    <div className="mb-4">
      <Input
        value={question}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)} // Fixed e Type
        placeholder="Enter question"
      />
      <Button onClick={handleAdd} className="mt-2">Add Question</Button>
    </div>
  );
};

export default QuestionForm;
