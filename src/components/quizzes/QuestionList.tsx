import Button from "../ui/Button"; // Fixed Import Path

interface Question {
  text: string;
}

interface QuestionListProps {
  questions: Question[];
  removeQuestion: (index: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, removeQuestion }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Questions</h2>
      <ul>
        {questions.map((q, index) => (
          <li key={index} className="flex justify-between items-center">
            {q.text}
            <Button onClick={() => removeQuestion(index)} className="ml-2">Remove</Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionList;
