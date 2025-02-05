import Input from "../ui/Input";
import Label from "../ui/Label"; 
import Select from "../ui/Select"; 

interface Course {
  id: string;
  name: string;
}

interface Quiz {
  title: string;
  description: string;
  course_id: string;
}

interface QuizFormProps {
  quiz: Quiz;
  setQuiz: (quiz: Quiz) => void;
  courses: Course[];
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, setQuiz, courses }) => {
  return (
    <div className="mb-4">
      <Label>Quiz Title</Label>
      <Input
        value={quiz.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setQuiz({ ...quiz, title: e.target.value })
        }
      />

      <Label>Description</Label>
      <Input
        value={quiz.description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setQuiz({ ...quiz, description: e.target.value })
        }
      />

      <Label>Course</Label>
      <Select
        value={quiz.course_id}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setQuiz({ ...quiz, course_id: e.target.value })
        }
      >
        <option value="">Select a course</option>
        {courses.map((course: Course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default QuizForm;
