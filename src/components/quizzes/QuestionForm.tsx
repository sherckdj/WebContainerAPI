import { useState } from "react";
import { Input, Button } from "@/components/ui";

const QuestionForm = ({ addQuestion }) => {
  const [question, setQuestion] = useState("");

  const handleAdd = () => {
    if (question.trim()) {
      addQuestion({ text: question });
      setQuestion("");
    }
  };

  return (
    <div className="mb-4">
      <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" />
      <Button onClick={handleAdd} className="mt-2">Add Question</Button>
    </div>
  );
};
export default QuestionForm;