-- Create quiz tables
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  order_number integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz options table for multiple choice
CREATE TABLE quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create quiz submissions table
CREATE TABLE quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric(5,2),
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, user_id)
);

-- Create quiz answers table
CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_id uuid NOT NULL REFERENCES quiz_options(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, question_id)
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for quizzes
CREATE POLICY "Instructors can manage quizzes"
  ON quizzes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quizzes.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view quizzes"
  ON quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'enrolled'
    )
  );

-- Create policies for quiz questions
CREATE POLICY "Instructors can manage questions"
  ON quiz_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view questions"
  ON quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'enrolled'
    )
  );

-- Create policies for quiz options
CREATE POLICY "Instructors can manage options"
  ON quiz_options
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quiz_questions.id = quiz_options.question_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view options"
  ON quiz_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = quiz_options.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'enrolled'
    )
  );

-- Create policies for quiz submissions
CREATE POLICY "Students can manage their submissions"
  ON quiz_submissions
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can view submissions"
  ON quiz_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_submissions.quiz_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Create policies for quiz answers
CREATE POLICY "Students can manage their answers"
  ON quiz_answers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_submissions
      WHERE quiz_submissions.id = quiz_answers.submission_id
      AND quiz_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view answers"
  ON quiz_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_submissions
      JOIN quizzes ON quizzes.id = quiz_submissions.quiz_id
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quiz_submissions.id = quiz_answers.submission_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_options_question ON quiz_options(question_id);
CREATE INDEX idx_submissions_quiz ON quiz_submissions(quiz_id);
CREATE INDEX idx_submissions_user ON quiz_submissions(user_id);
CREATE INDEX idx_answers_submission ON quiz_answers(submission_id);
CREATE INDEX idx_answers_question ON quiz_answers(question_id);