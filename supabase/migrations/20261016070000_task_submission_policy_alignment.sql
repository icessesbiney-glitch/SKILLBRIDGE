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
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'task_submissions'
      AND column_name = 'applicant_id'
  ) THEN
    RAISE EXCEPTION 'Required task-submission ownership columns are missing; migration stopped.';
  END IF;
END;
$$;

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own draft submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can edit their own draft submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can insert own task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can read own task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can update own task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Learners can read own task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Learners can insert own task submissions" ON public.task_submissions;

CREATE POLICY "Learners can read own task submissions"
ON public.task_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = applicant_id);

CREATE POLICY "Learners can insert own task submissions"
ON public.task_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND auth.uid() = applicant_id
  AND status IN ('draft', 'submitted', 'Pending Review')
);

CREATE POLICY "Learners can update own draft submissions"
ON public.task_submissions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND auth.uid() = applicant_id
  AND status = 'draft'
)
WITH CHECK (
  auth.uid() = user_id
  AND auth.uid() = applicant_id
  AND status IN ('draft', 'submitted', 'Pending Review')
);

COMMIT;
