import { Select, Input, Label } from "@/components/ui";

const QuizForm = ({ quiz, setQuiz, courses }) => {
  return (
    <div className="mb-4">
      <Label>Quiz Title</Label>
      <Input value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
      <Label>Description</Label>
      <Input value={quiz.description} onChange={(e) => setQuiz({ ...quiz, description: e.target.value })} />
      <Label>Course</Label>
      <Select value={quiz.course_id} onChange={(e) => setQuiz({ ...quiz, course_id: e.target.value })}>
        <option value="">Select a course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>{course.name}</option>
        ))}
      </Select>
    </div>
  );
};
export default QuizForm;