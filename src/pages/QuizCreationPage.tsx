import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import QuizForm from "../components/quizzes/QuizForm";
import QuestionList from "../components/quizzes/QuestionList";
import QuestionForm from "../components/quizzes/QuestionForm";
import { Button } from "@/components/ui/button";

const QuizCreationPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [quiz, setQuiz] = useState({ title: "", description: "", course_id: "" });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("id, name");
      if (error) console.error(error);
      else setCourses(data);
    };
    fetchCourses();
  }, []);

  const addQuestion = (question) => {
    setQuestions([...questions, question]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert([{ ...quiz }])
      .select();

    if (quizError) {
      console.error(quizError);
      return;
    }

    const quizId = quizData[0].id;
    const questionsWithQuizId = questions.map((q) => ({ ...q, quiz_id: quizId }));

    const { error: questionError } = await supabase.from("questions").insert(questionsWithQuizId);
    if (questionError) console.error(questionError);
    else navigate("/quizzes");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New Quiz</h1>
      <QuizForm quiz={quiz} setQuiz={setQuiz} courses={courses} />
      <QuestionForm addQuestion={addQuestion} />
      <QuestionList questions={questions} removeQuestion={removeQuestion} />
      <Button className="mt-4" onClick={handleSubmit}>Save Quiz</Button>
    </div>
  );
};

export default QuizCreationPage;