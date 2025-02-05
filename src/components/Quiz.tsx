import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    answer: "Mars",
  },
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === quizQuestions[currentQuestion].answer) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-4 text-center">
          {!showResults ? (
            <>
              <h2 className="text-xl font-bold mb-4">{quizQuestions[currentQuestion].question}</h2>
              <div className="space-y-2">
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full ${selectedOption === option ? "bg-blue-500 text-white" : ""}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button onClick={handleNextQuestion} className="mt-4" disabled={!selectedOption}>
                Next
              </Button>
            </>
          ) : (
            <h2 className="text-xl font-bold">Your score: {score} / {quizQuestions.length}</h2>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
