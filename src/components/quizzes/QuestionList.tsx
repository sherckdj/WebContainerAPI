import { Button } from "@/components/ui";

const QuestionList = ({ questions, removeQuestion }) => {
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