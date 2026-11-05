ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_tier text NOT NULL DEFAULT 'Beginner';

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  difficulty_level text NOT NULL,
  is_premium boolean NOT NULL DEFAULT false,
  total_lessons integer NOT NULL DEFAULT 0 CHECK (total_lessons >= 0)
);

CREATE TABLE IF NOT EXISTS public.paid_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  payout_amount numeric(12, 2) NOT NULL CHECK (payout_amount >= 0),
  required_tier text NOT NULL DEFAULT 'Premium',
  deadline timestamptz
);

CREATE OR REPLACE FUNCTION public.has_premium_account_tier()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND lower(btrim(account_tier)) IN ('premium', 'premaximal')
  );
$$;

REVOKE ALL ON FUNCTION public.has_premium_account_tier() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_premium_account_tier() TO anon, authenticated;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read free and entitled courses" ON public.courses;
CREATE POLICY "Read free and entitled courses"
  ON public.courses
  FOR SELECT
  USING (
    (
      NOT is_premium
      AND lower(btrim(difficulty_level)) NOT LIKE 'advanced%'
    )
    OR public.has_premium_account_tier()
  );

DROP POLICY IF EXISTS "Read paid tasks for premium accounts" ON public.paid_tasks;
CREATE POLICY "Read paid tasks for premium accounts"
  ON public.paid_tasks
  FOR SELECT
  USING (public.has_premium_account_tier());

GRANT SELECT ON TABLE public.courses, public.paid_tasks TO anon, authenticated;
