-- SkillBridge task-submission compatibility and learner access hardening.
-- Does not modify wallet/payment tables or withdrawal routes.
BEGIN;

DO $$
BEGIN
  IF to_regclass('public.task_submissions') IS NULL THEN
    RAISE EXCEPTION 'public.task_submissions does not exist; migration stopped.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'task_submissions'
      AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'task_submissions.user_id is missing; migration stopped.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'task_submissions'
      AND column_name = 'file_storage_path'
  ) THEN
    RAISE EXCEPTION 'task_submissions.file_storage_path is missing; migration stopped.';
  END IF;
END;
$$;

ALTER TABLE public.task_submissions
  ADD COLUMN IF NOT EXISTS submission_text text;

ALTER TABLE public.task_submissions
  ALTER COLUMN file_storage_path DROP NOT NULL;

DROP POLICY IF EXISTS "Allow users to process task submissions"
  ON public.task_submissions;

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners can read own task submissions"
  ON public.task_submissions;

CREATE POLICY "Learners can read own task submissions"
  ON public.task_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert own task submissions"
  ON public.task_submissions;

CREATE POLICY "Learners can insert own task submissions"
  ON public.task_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMIT;