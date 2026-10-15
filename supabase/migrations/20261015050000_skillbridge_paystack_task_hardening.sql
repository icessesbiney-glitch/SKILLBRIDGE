-- SkillBridge task submission and private deliverable storage hardening.
-- Preserve the existing user_wallets, wallet_transactions, and
-- credit_paystack_wallet implementation.

DO $$
BEGIN
  IF to_regclass('public.task_submissions') IS NULL THEN
    RAISE EXCEPTION 'public.task_submissions is missing; migration stopped.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
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
