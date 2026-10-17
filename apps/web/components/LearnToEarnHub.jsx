'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';

const curriculum = [
  {
    id: 'ACA-01',
    area: 'Academic',
    title: 'Reading, Writing and Communication',
    description: 'Build the reading, writing, comprehension and communication skills used in school, work and everyday life.',
    lessons: [
      'Reading comprehension and understanding instructions',
      'Writing clear sentences and paragraphs',
      'Spelling, grammar and everyday communication',
      'Writing messages, emails and simple reports',
    ],
  },
  {
    id: 'ACA-02',
    area: 'Academic',
    title: 'Mathematics and Everyday Numeracy',
    description: 'Learn numbers and calculations for daily life, education, work and money management.',
    lessons: [
      'Whole numbers, addition and subtraction',
      'Multiplication, division and fractions',
      'Percentages, measurements and everyday calculations',
      'Budgets, prices and comparing costs',
    ],
  },
  {
    id: 'ACA-03',
    area: 'Academic',
    title: 'Science and Critical Thinking',
    description: 'Develop observation, reasoning, problem-solving and an understanding of the world around you.',
    lessons: [
      'Observation and asking useful questions',
      'Recognising facts, opinions and evidence',
      'Basic health, hygiene and environmental awareness',
      'Solving problems step by step',
    ],
  },
  {
    id: 'ACA-04',
    area: 'Academic',
    title: 'Financial and Business Literacy',
    description: 'Understand basic money management before making decisions about earnings, savings and business.',
    lessons: [
      'Needs, wants and personal budgeting',
      'Income, expenses and savings',
      'Understanding prices, profit and loss',
      'Recognising scams and protecting financial information',
    ],
  },
  {
    id: 'DIG-01',
    area: 'Practical Skills',
    title: 'Phone and Digital Literacy',
    description: 'Start with the practical digital skills needed to learn and work using a smartphone or computer.',
    lessons: [
      'Using apps, menus and accessibility features',
      'Internet searches and evaluating information',
      'Email, attachments and safe file handling',
      'Passwords, privacy and online safety',
    ],
  },
  {
    id: 'SKL-01',
    area: 'Practical Skills',
    title: 'Typing, Documents and Spreadsheets',
    description: 'Learn useful office skills for administrative work, records and simple projects.',
    lessons: [
      'Typing and formatting a document',
      'Creating a simple CV or profile',
      'Entering information into a spreadsheet',
      'Organising records and checking your work',
    ],
  },
  {
    id: 'SKL-02',
    area: 'Practical Skills',
    title: 'Customer Service and Communication',
    description: 'Practise respectful communication and problem-solving for real customer and support tasks.',
    lessons: [
      'Understanding a customer request',
      'Writing clear and respectful replies',
      'Handling complaints and asking clarifying questions',
      'Following instructions and checking quality',
    ],
  },
  {
    id: 'SKL-03',
    area: 'Practical Skills',
    title: 'Creative and Digital Work',
    description: 'Explore entry-level content, design and digital project skills.',
    lessons: [
      'Planning a simple piece of content',
      'Basic layout and visual communication',
      'Creating a useful digital portfolio sample',
      'Reviewing and improving a project',
    ],
  },
  {
    id: 'SKL-04',
    area: 'Practical Skills',
    title: 'Entrepreneurship and Work Readiness',
    description: 'Learn how to organise work, meet deadlines and prepare for beginner opportunities.',
    lessons: [
      'Breaking a project into manageable steps',
      'Following a task brief and checklist',
      'Managing time and meeting deadlines',
      'Preparing evidence of completed work',
    ],
  },
];

export default function LearnToEarnHub() {
  const [area, setArea] = useState('All');
  const [path, setPath] = useState('learn-earn');
  const [completed, setCompleted] = useState([]);
  const [userId, setUserId] = useState(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (user) {
          setUserId(user.id);

          const { data, error } = await supabase
            .from('user_learning_profiles')
            .select('completed_modules')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!cancelled && !error && data) {
            setCompleted(
              Array.isArray(data.completed_modules)
                ? data.completed_modules
                : [],
            );
          }
        }
      } catch {
        if (!cancelled) {
          setNotice('You can browse and start learning without signing in. Sign in when you need account features.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCourses = useMemo(
    () =>
      area === 'All'
        ? curriculum
        : curriculum.filter((course) => course.area === area),
    [area],
  );

  const totalLessons = curriculum.reduce(
    (sum, course) => sum + course.lessons.length,
    0,
  );

  async function completeLesson(lessonId) {
    if (completed.includes(lessonId) || saving) return;

    const next = [...completed, lessonId];
    setCompleted(next);
    setNotice('');

    if (!userId) {
      setNotice('Lesson marked complete for this visit. Sign in to use your account learning features.');
      return;
    }

    setSaving(lessonId);

    try {
      const { error } = await supabase
        .from('user_learning_profiles')
        .update({ completed_modules: next })
        .eq('user_id', userId);

      if (error) {
        setNotice('Lesson marked complete for this visit, but progress could not be synced to your account.');
      } else {
        setNotice('Learning progress saved when your existing learner profile was available.');
      }
    } catch {
      setNotice('Lesson marked complete for this visit. Account progress could not be synced.');
    } finally {
      setSaving('');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-950 p-6 text-white sm:p-10">
          <span className="inline-flex rounded-full bg-teal-400/15 px-3 py-1 text-xs font-bold text-teal-300">
            FREE TO START
          </span>

          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Learn for free. Build skills. Choose your future.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            SkillBridge brings academic foundations and practical skills together.
            Start with a phone, learn at your own pace, and explore eligible
            earning tasks when you are ready. You do not need a school,
            college, roll number or academic certificate to begin.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#free-curriculum"
              className="inline-flex min-h-11 items-center rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-300"
            >
              Start learning free
            </a>

            <Link
              href="/tasks"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Explore earning tasks
            </Link>
          </div>
        </header>

        <section aria-labelledby="path-heading" className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
              Your choice
            </p>
            <h2 id="path-heading" className="mt-2 text-2xl font-bold">
              Choose how you want to use SkillBridge
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Both paths start free. You can change your choice whenever you want.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setPath('learn-only')}
              aria-pressed={path === 'learn-only'}
              className={`rounded-2xl border p-5 text-left transition ${
                path === 'learn-only'
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Learning path
              </span>
              <h3 className="mt-2 text-lg font-bold">Learn only</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Study academic subjects and practical skills for free.
                There is no requirement to perform earning tasks.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPath('learn-earn')}
              aria-pressed={path === 'learn-earn'}
              className={`rounded-2xl border p-5 text-left transition ${
                path === 'learn-earn'
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Learning + earning path
              </span>
              <h3 className="mt-2 text-lg font-bold">Learn and earn</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Study for free, practise your skills, and explore eligible
                beginner tasks. Payment depends on the published task terms,
                approved work and verified payment process.
              </p>
            </button>
          </div>

          {path === 'learn-earn' && (
            <div className="rounded-2xl border border-teal-200 bg-white p-5">
              <h3 className="font-bold">Your earning next step</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You can browse available tasks now. Some tasks may have
                their own instructions or eligibility requirements. Simply
                completing a lesson does not create a cash reward.
              </p>
              <Link
                href="/tasks"
                className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
              >
                Browse available tasks
              </Link>
            </div>
          )}

          <p className="rounded-xl bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
            <strong>Upgrading is optional.</strong> You can continue with free
            learning and eligible tasks without being forced to purchase an
            upgrade. Any future upgrade must have clear terms before you choose it.
          </p>
        </section>

        <section id="free-curriculum" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                Academic + practical curriculum
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Your free learning workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Academic learning is part of the curriculum, alongside
                hands-on skills. No formal academic qualification is needed to start.
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200">
              <span className="font-bold">{completed.length}</span>
              <span className="text-slate-600"> of {totalLessons} lessons marked complete</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter learning subjects">
            {['All', 'Academic', 'Practical Skills'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setArea(filter)}
                aria-pressed={area === filter}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  area === filter
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {loading && (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              Checking saved learning progress…
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {visibleCourses.map((course) => (
              <article
                key={course.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                    {course.area}
                  </span>
                  <span className="text-xs text-slate-500">
                    {course.lessons.length} beginner lessons
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold">{course.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {course.description}
                </p>

                <ul className="mt-4 space-y-3">
                  {course.lessons.map((lesson, index) => {
                    const lessonId = `${course.id}-${index + 1}`;
                    const done = completed.includes(lessonId);

                    return (
                      <li
                        key={lessonId}
                        className="flex items-start justify-between gap-3 border-t border-slate-100 pt-3"
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 text-xs font-bold text-slate-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className={`text-sm leading-6 ${done ? 'text-slate-500' : 'text-slate-800'}`}>
                            {lesson}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => completeLesson(lessonId)}
                          disabled={done || saving === lessonId}
                          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${
                            done
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-teal-700 text-white hover:bg-teal-800'
                          }`}
                        >
                          {done ? 'Completed' : saving === lessonId ? 'Saving…' : 'Mark done'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>

          {notice && (
            <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
              {notice}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-xl font-bold">Ready for your next step?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Continue learning, review available work, or access your account.
            You do not need to upgrade to keep using the free learning path.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tasks"
              className="inline-flex min-h-10 items-center rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
            >
              Task marketplace
            </Link>
            <Link
              href="/auth"
              className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Account access
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
