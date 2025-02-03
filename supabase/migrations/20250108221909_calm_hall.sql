/*
  # Micro-apps Management System

  1. New Tables
    - `apps` - Stores available micro-applications
      - `id` (uuid, primary key)
      - `name` (text) - App name
      - `slug` (text) - URL-friendly identifier
      - `description` (text)
      - `type` (text) - App type (e.g., 'grader', 'quiz', 'simulation')
      - `config_schema` (jsonb) - JSON Schema for app configuration
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `app_instances` - Stores specific instances of apps in courses
      - `id` (uuid, primary key)
      - `app_id` (uuid) - Reference to apps table
      - `course_id` (uuid) - Reference to courses table
      - `content_id` (uuid) - Reference to course_content table
      - `title` (text) - Instance-specific title
      - `config` (jsonb) - Instance configuration
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `app_submissions` - Stores student submissions and grades
      - `id` (uuid, primary key)
      - `instance_id` (uuid) - Reference to app_instances
      - `user_id` (uuid) - Student who submitted
      - `submission_data` (jsonb) - Submission content
      - `grade` (numeric) - Automatically calculated grade
      - `feedback` (text) - Automated or instructor feedback
      - `status` (text) - Submission status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create apps table
CREATE TABLE apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  type text NOT NULL,
  config_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_instances table
CREATE TABLE app_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content_id uuid REFERENCES course_content(id) ON DELETE SET NULL,
  title text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_submissions table
CREATE TABLE app_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES app_instances(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  grade numeric CHECK (grade >= 0 AND grade <= 100),
  feedback text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(instance_id, user_id)
);

-- Enable RLS
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for apps table
CREATE POLICY "Apps are viewable by all authenticated users"
  ON apps
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage apps"
  ON apps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policies for app_instances table
CREATE POLICY "App instances are viewable by course participants"
  ON app_instances
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = app_instances.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'enrolled'
    ) OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = app_instances.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage their course app instances"
  ON app_instances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = app_instances.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Create policies for app_submissions table
CREATE POLICY "Students can view and create their own submissions"
  ON app_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can submit their work"
  ON app_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Instructors can view and grade submissions"
  ON app_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_instances ai
      JOIN courses c ON c.id = ai.course_id
      WHERE ai.id = app_submissions.instance_id
      AND c.instructor_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_app_instances_course ON app_instances(course_id);
CREATE INDEX idx_app_instances_content ON app_instances(content_id);
CREATE INDEX idx_app_submissions_instance ON app_submissions(instance_id);
CREATE INDEX idx_app_submissions_user ON app_submissions(user_id);
CREATE INDEX idx_apps_slug ON apps(slug);