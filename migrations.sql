create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email varchar not null unique,
  full_name varchar,
  avatar_url varchar,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data" 
  on public.users for select 
  using (auth.uid() = id);

create policy "Users can update their own data" 
  on public.users for update 
  using (auth.uid() = id);

create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name varchar not null unique,
  description text,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.subjects enable row level security;

-- Create policies
create policy "Subjects are viewable by everyone" 
  on public.subjects for select 
  to authenticated
  using (true);

create table public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  title varchar not null,
  description text,
  subject_id uuid references public.subjects not null,
  creator_id uuid references public.users not null,
  time_limit integer default 0,
  due_date date,
  is_public boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.quizzes enable row level security;

-- Create policies
create policy "Quizzes are viewable by everyone if public" 
  on public.quizzes for select 
  to authenticated
  using (is_public = true or creator_id = auth.uid());

create policy "Users can create their own quizzes" 
  on public.quizzes for insert 
  to authenticated
  with check (creator_id = auth.uid());

create policy "Users can update their own quizzes" 
  on public.quizzes for update 
  to authenticated
  using (creator_id = auth.uid());

create policy "Users can delete their own quizzes" 
  on public.quizzes for delete 
  to authenticated
  using (creator_id = auth.uid());


create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  text text not null,
  type varchar not null check (type in ('multiple-choice', 'checkbox', 'text')),
  points integer default 1 not null,
  order_num integer not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.questions enable row level security;

-- Create policies
create policy "Questions are viewable if the related quiz is viewable" 
  on public.questions for select 
  to authenticated
  using (
    exists (
      select 1 from public.quizzes 
      where quizzes.id = questions.quiz_id 
      and (quizzes.is_public = true or quizzes.creator_id = auth.uid())
    )
  );

create policy "Users can create questions for their own quizzes" 
  on public.questions for insert 
  to authenticated
  with check (
    exists (
      select 1 from public.quizzes 
      where quizzes.id = questions.quiz_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can update questions for their own quizzes" 
  on public.questions for update 
  to authenticated
  using (
    exists (
      select 1 from public.quizzes 
      where quizzes.id = questions.quiz_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can delete questions for their own quizzes" 
  on public.questions for delete 
  to authenticated
  using (
    exists (
      select 1 from public.quizzes 
      where quizzes.id = questions.quiz_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create table public.options (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions on delete cascade not null,
  text text not null,
  option_id varchar not null,
  created_at timestamp with time zone default now() not null,
  unique (question_id, option_id)
);

-- Enable RLS
alter table public.options enable row level security;

-- Create policies
create policy "Options are viewable if the related question is viewable" 
  on public.options for select 
  to authenticated
  using (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = options.question_id 
      and (quizzes.is_public = true or quizzes.creator_id = auth.uid())
    )
  );

create policy "Users can create options for their own questions" 
  on public.options for insert 
  to authenticated
  with check (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = options.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can update options for their own questions" 
  on public.options for update 
  to authenticated
  using (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = options.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can delete options for their own questions" 
  on public.options for delete 
  to authenticated
  using (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = options.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create table public.answers (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions on delete cascade not null,
  correct_answer jsonb not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.answers enable row level security;

-- Create policies
create policy "Answers are viewable by quiz creators" 
  on public.answers for select 
  to authenticated
  using (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = answers.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can create answers for their own questions" 
  on public.answers for insert 
  to authenticated
  with check (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = answers.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can update answers for their own questions" 
  on public.answers for update 
  to authenticated
  using (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = answers.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can delete answers for their own questions" 
  on public.answers for delete 
  to authenticated
  using (
    exists (
      select 1 from public.questions 
      join public.quizzes on quizzes.id = questions.quiz_id
      where questions.id = answers.question_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  user_id uuid references public.users not null,
  start_time timestamp with time zone default now() not null,
  end_time timestamp with time zone,
  score integer,
  max_score integer,
  is_complete boolean default false
);

-- Enable RLS
alter table public.quiz_attempts enable row level security;

-- Create policies
create policy "Users can view their own quiz attempts" 
  on public.quiz_attempts for select 
  to authenticated
  using (user_id = auth.uid());

create policy "Quiz creators can view attempts for their quizzes" 
  on public.quiz_attempts for select 
  to authenticated
  using (
    exists (
      select 1 from public.quizzes 
      where quizzes.id = quiz_attempts.quiz_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can create their own quiz attempts" 
  on public.quiz_attempts for insert 
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own quiz attempts" 
  on public.quiz_attempts for update 
  to authenticated
  using (user_id = auth.uid());

create table public.user_answers (
  id uuid default uuid_generate_v4() primary key,
  attempt_id uuid references public.quiz_attempts on delete cascade not null,
  question_id uuid references public.questions not null,
  user_answer jsonb not null,
  is_correct boolean,
  points_earned integer default 0,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.user_answers enable row level security;

-- Create policies
create policy "Users can view their own answers" 
  on public.user_answers for select 
  to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts 
      where quiz_attempts.id = user_answers.attempt_id 
      and quiz_attempts.user_id = auth.uid()
    )
  );

create policy "Quiz creators can view answers for their quizzes" 
  on public.user_answers for select 
  to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts 
      join public.quizzes on quizzes.id = quiz_attempts.quiz_id
      where quiz_attempts.id = user_answers.attempt_id 
      and quizzes.creator_id = auth.uid()
    )
  );

create policy "Users can create their own answers" 
  on public.user_answers for insert 
  to authenticated
  with check (
    exists (
      select 1 from public.quiz_attempts 
      where quiz_attempts.id = user_answers.attempt_id 
      and quiz_attempts.user_id = auth.uid()
    )
  );

create policy "Users can update their own answers" 
  on public.user_answers for update 
  to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts 
      where quiz_attempts.id = user_answers.attempt_id 
      and quiz_attempts.user_id = auth.uid()
    )
  );

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
before update on public.users
for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
before update on public.quizzes
for each row execute procedure public.handle_updated_at();

create or replace function public.calculate_quiz_score()
returns trigger as $$
begin
  if new.is_complete = true and old.is_complete = false then
    select
      sum(ua.points_earned) as earned,
      sum(q.points) as max
    into
      new.score,
      new.max_score
    from
      public.user_answers ua
      join public.questions q on q.id = ua.question_id
    where
      ua.attempt_id = new.id;
      
    new.end_time = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger calculate_quiz_score
before update on public.quiz_attempts
for each row execute procedure public.calculate_quiz_score();

-- Modify the users table to add a role field
ALTER TABLE public.users 
ADD COLUMN role VARCHAR NOT NULL DEFAULT 'student' 
CHECK (role IN ('teacher', 'student'));


-- Update quizzes table policies to restrict creation to teachers only
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can create quizzes" 
  ON public.quizzes FOR INSERT 
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

-- Update policies for quiz modification
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can update their own quizzes" 
  ON public.quizzes FOR UPDATE 
  TO authenticated
  USING (
    creator_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can delete their own quizzes" 
  ON public.quizzes FOR DELETE 
  TO authenticated
  USING (
    creator_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

-- Questions table
DROP POLICY IF EXISTS "Users can create questions for their own quizzes" ON public.questions;
CREATE POLICY "Teachers can create questions for their own quizzes" 
  ON public.questions FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can update questions for their own quizzes" ON public.questions;
CREATE POLICY "Teachers can update questions for their own quizzes" 
  ON public.questions FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can delete questions for their own quizzes" ON public.questions;
CREATE POLICY "Teachers can delete questions for their own quizzes" 
  ON public.questions FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- Options table
DROP POLICY IF EXISTS "Users can create options for their own questions" ON public.options;
CREATE POLICY "Teachers can create options for their own questions" 
  ON public.options FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.quizzes ON quizzes.id = questions.quiz_id
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE questions.id = options.question_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can update options for their own questions" ON public.options;
CREATE POLICY "Teachers can update options for their own questions" 
  ON public.options FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.quizzes ON quizzes.id = questions.quiz_id
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE questions.id = options.question_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can delete options for their own questions" ON public.options;
CREATE POLICY "Teachers can delete options for their own questions" 
  ON public.options FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.quizzes ON quizzes.id = questions.quiz_id
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE questions.id = options.question_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

-- Answers table
DROP POLICY IF EXISTS "Users can create answers for their own questions" ON public.answers;
CREATE POLICY "Teachers can create answers for their own questions" 
  ON public.answers FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.quizzes ON quizzes.id = questions.quiz_id
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE questions.id = answers.question_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can update answers for their own questions" ON public.answers;
CREATE POLICY "Teachers can update answers for their own questions" 
  ON public.answers FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.quizzes ON quizzes.id = questions.quiz_id
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE questions.id = answers.question_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Users can delete answers for their own questions" ON public.answers;
CREATE POLICY "Teachers can delete answers for their own questions" 
  ON public.answers FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.quizzes ON quizzes.id = questions.quiz_id
      JOIN public.users ON users.id = quizzes.creator_id
      WHERE questions.id = answers.question_id 
      AND quizzes.creator_id = auth.uid()
      AND users.role = 'teacher'
    )
  );


-- Create a classrooms table to manage teacher-student relationships
CREATE TABLE public.classrooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT teacher_role_check CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = teacher_id
      AND users.role = 'teacher'
    )
  )
);

-- Enable RLS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Create policies for classrooms
CREATE POLICY "Teachers can create classrooms" 
  ON public.classrooms FOR INSERT 
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage their own classrooms" 
  ON public.classrooms FOR ALL 
  TO authenticated
  USING (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Classrooms are viewable by enrolled students" 
  ON public.classrooms FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.classroom_id = classrooms.id
      AND enrollments.student_id = auth.uid()
    )
  );

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  classroom_id UUID REFERENCES public.classrooms ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT student_role_check CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = student_id
      AND users.role = 'student'
    )
  ),
  UNIQUE (classroom_id, student_id)
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for enrollments
CREATE POLICY "Teachers can manage enrollments for their classrooms" 
  ON public.enrollments FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms
      JOIN public.users ON users.id = classrooms.teacher_id
      WHERE classrooms.id = enrollments.classroom_id
      AND classrooms.teacher_id = auth.uid()
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Students can view their own enrollments" 
  ON public.enrollments FOR SELECT 
  TO authenticated
  USING (student_id = auth.uid());

-- Modify quizzes table to add classroom association
ALTER TABLE public.quizzes 
ADD COLUMN classroom_id UUID REFERENCES public.classrooms;

-- Create policy to restrict quiz access to enrolled students
CREATE POLICY "Quizzes are viewable by enrolled students" 
  ON public.quizzes FOR SELECT 
  TO authenticated
  USING (
    is_public = true OR 
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.classroom_id = quizzes.classroom_id
      AND enrollments.student_id = auth.uid()
    )
  );


