'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SiteChrome from '../components/SiteChrome';
import { supabase } from '../utils/supabaseClient';

interface Course {
  id: string;
  title: string;
  category: string;
  instructor_name: string;
  price: number;
  currency: string;
  description: string;
}

interface TaskFile {
  name: string;
  type: string;
  size: string;
  url: string;
}

interface Task {
  id: string;
  course_id: string;
  title: string;
  points: number;
  is_completed: boolean;
  due_date?: string;
  instructions?: string;
  files?: TaskFile[];
  status?: 'available' | 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
}

interface TaskSubmission {
  taskId: string;
  answer: string;
  fileName: string;
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
}

function createMockFile(
  name: string,
  type: string,
  size: string,
  content: string
): TaskFile {
  return {
    name,
    type,
    size,
    url: `data:${type};charset=utf-8,${encodeURIComponent(content)}`
  };
}

function buildStarterTasks(courseId: string): Task[] {
  return [
    {
      id: 'starter-task-uiux',
      course_id: courseId,
      title: 'UI/UX Landing Page Review',
      points: 100,
      is_completed: false,
      due_date: '2026-10-15',
      status: 'available',
      instructions:
        'Review the supplied landing-page brief and identify at least five usability improvements. Explain why each improvement matters and provide a short recommendation for implementation.',
      files: [
        createMockFile(
          'client-brief.txt',
          'text/plain',
          '2 KB',
          `SKILLBRIDGE CLIENT BRIEF

Project:
Student Career Platform Landing Page

Goal:
Create a clear landing page that helps students understand how SkillBridge works.

Primary audience:
University students and early-career professionals.

Current concerns:
1. The primary call-to-action is difficult to find.
2. The page contains too much text above the fold.
3. Benefits are not clearly separated.
4. The task marketplace is not obvious.
5. Mobile navigation needs improvement.

Deliverable:
Provide five or more practical UX recommendations.

Please explain:
- What should change
- Why it should change
- How the change could improve the user experience
`
        ),
        createMockFile(
          'brand-notes.md',
          'text/markdown',
          '1 KB',
          `# SkillBridge Brand Notes

## Tone
Professional, encouraging, practical.

## Audience
Students building employable skills.

## Core message
Learn skills. Build proof. Complete paid work.

## Important action
Students should always be able to discover their next useful action quickly.
`
        )
      ]
    },

    {
      id: 'starter-task-responsive',
      course_id: courseId,
      title: 'Build a Responsive Pricing Section',
      points: 150,
      is_completed: false,
      due_date: '2026-10-20',
      status: 'available',
      instructions:
        'Build a responsive pricing section using HTML, CSS, or React. The section should clearly show the available plans, prices, features, and primary action for each plan.',
      files: [
        createMockFile(
          'pricing-requirements.md',
          'text/markdown',
          '2 KB',
          `# Pricing Section Requirements

Create a responsive pricing section.

Required plans:

1. Starter
Price: GHS 0
Features:
- Basic learning access
- Public profile
- Selected free tasks

2. Pro
Price: GHS 99/month
Features:
- Full learning catalog
- Paid task access
- Portfolio tools
- Priority support

3. Career
Price: GHS 199/month
Features:
- Everything in Pro
- Mentor access
- Advanced opportunities
- Career preparation

Requirements:
- Mobile responsive
- Clear plan hierarchy
- Accessible buttons
- Good spacing
- Readable typography
`
        ),
        createMockFile(
          'content-copy.txt',
          'text/plain',
          '1 KB',
          `STARTER

Start learning without a subscription.

PRO

Build skills and access more paid opportunities.

CAREER

Get deeper support as you prepare for professional work.
`
        )
      ]
    },

    {
      id: 'starter-task-react',
      course_id: courseId,
      title: 'React Component Debugging',
      points: 200,
      is_completed: false,
      due_date: '2026-10-25',
      status: 'available',
      instructions:
        'Inspect the supplied bug report and explain how you would identify and fix the reported React issues. Your submission should include the likely cause, proposed fix, and testing approach.',
      files: [
        createMockFile(
          'bug-report.txt',
          'text/plain',
          '2 KB',
          `BUG REPORT

Component:
TaskCard.tsx

Problem 1:
The completion checkbox changes visually but the database does not update.

Problem 2:
The component sometimes displays an old task title after navigation.

Problem 3:
The submit button can be clicked multiple times while the request is processing.

Expected response:
Explain the likely cause of each issue and describe how you would fix it safely.
`
        ),
        createMockFile(
          'test-cases.csv',
          'text/csv',
          '1 KB',
          `test_case,expected_result
checkbox updates database,task status changes successfully
navigate away and return,latest task title is displayed
submit twice quickly,only one submission request is processed
network request fails,user sees an actionable error
`
        )
      ]
    }
  ];
}

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'tasks'>('catalog');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'saving' | 'saved' | 'submitting' | 'submitted' | 'error'
  >('idle');

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState('50');

  const [search, setSearch] = useState('');

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.instructions?.toLowerCase().includes(query)
      );
    });
  }, [tasks, search]);

  useEffect(() => {
    async function loadCatalogAndSecurity() {
      try {
        const {
          data: catalogData,
          error: catalogError
        } = await supabase
          .from('course_catalog')
          .select('*')
          .order('created_at', { ascending: true });

        let loadedCourses: Course[] = [];

        if (catalogData && !catalogError) {
          loadedCourses = catalogData as Course[];
          setCourses(loadedCourses);
        }

        const {
          data: taskData,
          error: taskError
        } = await supabase
          .from('task_catalog')
          .select('*')
          .order('created_at', { ascending: true });

        if (taskData && !taskError && taskData.length > 0) {
          setTasks(taskData as Task[]);
        } else {
          /*
           * Development/starter tasks.
           *
           * These are only displayed when the real Supabase
           * task_catalog table has no records.
           *
           * Once you create real tasks in Supabase, those
           * records automatically become the tasks shown here.
           */
          const firstCourseId =
            loadedCourses[0]?.id || 'skillbridge-starter-course';

          setTasks(buildStarterTasks(firstCourseId));
        }

        if (taskError) {
          console.warn(
            'Task catalog is not available yet. Showing starter tasks:',
            taskError.message
          );
        }

        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (user) {
          const {
            data: adminRole,
            error: adminError
          } = await supabase
            .from('skillbridge_admin_registry')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (
            !adminError &&
            adminRole &&
            (adminRole.role === 'academy_admin' ||
              adminRole.role === 'course_instructor')
          ) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error(
          'Error establishing connection with catalog nodes:',
          err
        );

        setTasks(
          buildStarterTasks(
            courses[0]?.id || 'skillbridge-starter-course'
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadCatalogAndSecurity();
  }, []);

  const handleEnrollmentCheckout = async (course: Course) => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          'Please sign in or create a SkillBridge account to enroll in this module.'
        );
        window.location.href = '/auth';
        return;
      }

      console.log(
        'Initializing secure SkillBridge checkout session...',
        {
          product_id: course.id,
          user_id: user.id,
          amount: course.price
        }
      );

      window.location.href =
        `https://dodopayments.com?product_id=${course.id}` +
        `&user_id=${user.id}` +
        `&customer_email=${encodeURIComponent(user.email || '')}` +
        `&redirect_url=${encodeURIComponent(
          window.location.origin + '/dashboard?checkout=success'
        )}`;
    } catch (err) {
      console.error(
        'Dodo execution gateway failure context:',
        err
      );

      alert(
        'Failed to connect to the Dodo payment terminal. Please try again.'
      );
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle || !newCategory || !newPrice) {
      return;
    }

    const {
      data,
      error
    } = await supabase
      .from('course_catalog')
      .insert({
        title: newTitle,
        category: newCategory,
        price: parseFloat(newPrice),
        description: newDescription
      })
      .select()
      .single();

    if (data && !error) {
      setCourses([...courses, data as Course]);

      setNewTitle('');
      setNewCategory('');
      setNewPrice('');
      setNewDescription('');
    } else if (error) {
      alert(`Unable to publish module: ${error.message}`);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle || !selectedCourseId) {
      return;
    }

    const {
      data,
      error
    } = await supabase
      .from('task_catalog')
      .insert({
        title: newTaskTitle,
        course_id: selectedCourseId,
        points: parseInt(newTaskPoints, 10),
        is_completed: false
      })
      .select()
      .single();

    if (data && !error) {
      setTasks([...tasks, data as Task]);

      setNewTaskTitle('');
      setNewTaskPoints('50');
      setSelectedCourseId('');
    } else if (error) {
      alert(`Unable to publish task: ${error.message}`);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const updatedStatus = !task.is_completed;

    /*
     * Starter tasks are local development records.
     * Do not attempt a database update for them.
     */
    if (task.id.startsWith('starter-task-')) {
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                is_completed: updatedStatus
              }
            : item
        )
      );

      return;
    }

    const { error } = await supabase
      .from('task_catalog')
      .update({
        is_completed: updatedStatus
      })
      .eq('id', task.id);

    if (!error) {
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                is_completed: updatedStatus
              }
            : item
        )
      );
    } else {
      alert(`Unable to update task: ${error.message}`);
    }
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setSubmissionText('');
    setSubmissionFile(null);
    setSubmissionStatus('idle');
  };

  const closeTask = () => {
    setSelectedTask(null);
    setSubmissionText('');
    setSubmissionFile(null);
    setSubmissionStatus('idle');
  };

  const saveDraft = async () => {
    if (!selectedTask) {
      return;
    }

    setSubmissionStatus('saving');

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      /*
       * If the submissions table exists, store the draft.
       *
       * If it does not exist yet, we still keep the draft
       * in the current browser session so the workspace works
       * while the database table is being added.
       */
      if (user && !selectedTask.id.startsWith('starter-task-')) {
        const { error } = await supabase
          .from('task_submissions')
          .upsert(
            {
              task_id: selectedTask.id,
              applicant_id: user.id,
              answer_text: submissionText,
              status: 'draft'
            },
            {
              onConflict: 'task_id,applicant_id'
            }
          );

        if (error) {
          console.warn(
            'Draft database save was unavailable:',
            error.message
          );
        }
      }

      sessionStorage.setItem(
        `skillbridge-task-draft-${selectedTask.id}`,
        submissionText
      );

      setSubmissionStatus('saved');
    } catch (error) {
      console.error('Draft save failed:', error);

      sessionStorage.setItem(
        `skillbridge-task-draft-${selectedTask.id}`,
        submissionText
      );

      setSubmissionStatus('saved');
    }
  };

  const submitTask = async () => {
    if (!selectedTask) {
      return;
    }

    if (!submissionText.trim() && !submissionFile) {
      alert(
        'Please write an answer or select a file before submitting.'
      );
      return;
    }

    setSubmissionStatus('submitting');

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          'Please sign in before submitting a paid task.'
        );

        window.location.href = '/auth';
        return;
      }

      /*
       * Starter tasks can be tested immediately.
       * Real Supabase tasks use the task_submissions table.
       */
      if (selectedTask.id.startsWith('starter-task-')) {
        setTasks((currentTasks) =>
          currentTasks.map((item) =>
            item.id === selectedTask.id
              ? {
                  ...item,
                  status: 'submitted'
                }
              : item
          )
        );

        setSelectedTask({
          ...selectedTask,
          status: 'submitted'
        });

        setSubmissionStatus('submitted');
        return;
      }

      const { error } = await supabase
        .from('task_submissions')
        .upsert(
          {
            task_id: selectedTask.id,
            applicant_id: user.id,
            answer_text: submissionText,
            status: 'submitted'
          },
          {
            onConflict: 'task_id,applicant_id'
          }
        );

      if (error) {
        throw new Error(error.message);
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === selectedTask.id
            ? {
                ...item,
                status: 'submitted'
              }
            : item
        )
      );

      setSelectedTask({
        ...selectedTask,
        status: 'submitted'
      });

      setSubmissionStatus('submitted');
    } catch (error) {
      console.error('Task submission failed:', error);

      setSubmissionStatus('error');

      alert(
        'The submission could not be saved yet. Please check that the task_submissions table is available in Supabase.'
      );
    }
  };

  const loadSavedDraft = () => {
    if (!selectedTask) {
      return;
    }

    const saved = sessionStorage.getItem(
      `skillbridge-task-draft-${selectedTask.id}`
    );

    if (saved) {
      setSubmissionText(saved);
      setSubmissionStatus('saved');
    }
  };

  if (loading) {
    return (
      <SiteChrome>
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#475569',
            fontWeight: '500'
          }}
        >
          Syncing SkillBridge Catalog Infrastructure...
        </div>
      </SiteChrome>
    );
  }

  return (
    <SiteChrome>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 0'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                color: '#1e3a8a',
                marginBottom: '0.5rem',
                letterSpacing: '-0.025em'
              }}
            >
              SkillBridge Hub Portal
            </h1>

            <p
              style={{
                color: '#475569',
                fontSize: '1.1rem'
              }}
            >
              Learn skills, complete practical tasks, build proof,
              and move toward paid opportunities.
            </p>
          </div>

          {/* TAB SELECTOR */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '0.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor:
                  activeTab === 'catalog'
                    ? '#fff'
                    : 'transparent',
                color:
                  activeTab === 'catalog'
                    ? '#1e3a8a'
                    : '#64748b',
                boxShadow:
                  activeTab === 'catalog'
                    ? '0 1px 3px rgba(0,0,0,0.05)'
                    : 'none',
                transition: 'all 0.15s'
              }}
            >
              📚 Course Catalog
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor:
                  activeTab === 'tasks'
                    ? '#fff'
                    : 'transparent',
                color:
                  activeTab === 'tasks'
                    ? '#1e3a8a'
                    : '#64748b',
                boxShadow:
                  activeTab === 'tasks'
                    ? '0 1px 3px rgba(0,0,0,0.05)'
                    : 'none',
                transition: 'all 0.15s'
              }}
            >
              🎯 Paid Tasks
            </button>
          </div>
        </div>

        {/* COURSE CATALOG */}
        {activeTab === 'catalog' && (
          <>
            {isAdmin && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '3rem'
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1d4ed8',
                    marginBottom: '1rem'
                  }}
                >
                  ⚙️ Instructor Course Management Console
                </h2>

                <form
                  onSubmit={handleAddCourse}
                  style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(200px, 1fr))',
                    alignItems: 'end'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      Course Title
                    </span>

                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) =>
                        setNewTitle(e.target.value)
                      }
                      placeholder="e.g. Full-Stack Engineering"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      Department Category
                    </span>

                    <input
                      type="text"
                      required
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value)
                      }
                      placeholder="e.g. Cloud Architecture"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      Tuition Fee
                    </span>

                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) =>
                        setNewPrice(e.target.value)
                      }
                      placeholder="200"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      Brief Description
                    </span>

                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) =>
                        setNewDescription(e.target.value)
                      }
                      placeholder="Enter details..."
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      fontWeight: '600',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      height: '38px',
                      fontSize: '0.9rem'
                    }}
                  >
                    Publish Module
                  </button>
                </form>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gap: '2rem',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(320px, 1fr))'
              }}
            >
              {courses.map((course) => (
                <div
                  key={course.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#2563eb',
                        backgroundColor: '#eff6ff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}
                    >
                      {course.category}
                    </span>

                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        marginTop: '0.75rem',
                        marginBottom: '0.5rem',
                        color: '#0f172a'
                      }}
                    >
                      {course.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        marginBottom: '1rem'
                      }}
                    >
                      Lead Instructor:{' '}
                      <strong
                        style={{
                          color: '#475569'
                        }}
                      >
                        {course.instructor_name}
                      </strong>
                    </p>

                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#475569',
                        lineHeight: '1.5',
                        marginBottom: '1.5rem'
                      }}
                    >
                      {course.description ||
                        'No syllabus outline detailed for this training block yet.'}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '1rem',
                      marginTop: 'auto'
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          display: 'block',
                          fontWeight: '500'
                        }}
                      >
                        TUITION FEE
                      </span>

                      <span
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '800',
                          color: '#0f172a'
                        }}
                      >
                        {course.price.toFixed(2)}{' '}
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#64748b'
                          }}
                        >
                          {course.currency}
                        </span>
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleEnrollmentCheckout(course)
                      }
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Enroll via Dodo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {courses.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#64748b'
                }}
              >
                No active modules found in your training directory.
              </div>
            )}
          </>
        )}

        {/* TASK MARKETPLACE */}
        {activeTab === 'tasks' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '0.35rem'
                  }}
                >
                  Paid Task Marketplace
                </h2>

                <p
                  style={{
                    color: '#64748b',
                    margin: 0
                  }}
                >
                  Open a task, access its files, complete the work,
                  and submit your deliverable.
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                style={{
                  width: '260px',
                  maxWidth: '100%',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '0.6rem',
                  border: '1px solid #cbd5e1',
                  outline: 'none'
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isAdmin
                  ? 'minmax(0, 1fr) 340px'
                  : '1fr',
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gap: '1rem'
                }}
              >
                {filteredTasks.map((task) => {
                  const correlatedCourse = courses.find(
                    (course) =>
                      course.id === task.course_id
                  );

                  return (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.9rem',
                        padding: '1.25rem',
                        boxShadow:
                          '0 1px 3px rgba(15,23,42,0.04)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() =>
                              handleToggleTaskStatus(task)
                            }
                            aria-label={`Mark ${task.title} complete`}
                            style={{
                              marginTop: '0.3rem',
                              width: '18px',
                              height: '18px'
                            }}
                          />

                          <div>
                            <h3
                              style={{
                                margin: 0,
                                color: '#0f172a',
                                fontSize: '1.1rem',
                                fontWeight: '750'
                              }}
                            >
                              {task.title}
                            </h3>

                            <div
                              style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                marginTop: '0.45rem'
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#475569',
                                  background: '#f8fafc',
                                  border:
                                    '1px solid #e2e8f0',
                                  padding:
                                    '0.2rem 0.45rem',
                                  borderRadius:
                                    '0.35rem'
                                }}
                              >
                                {correlatedCourse
                                  ? correlatedCourse.title
                                  : 'SkillBridge Task'}
                              </span>

                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#166534',
                                  background: '#f0fdf4',
                                  border:
                                    '1px solid #bbf7d0',
                                  padding:
                                    '0.2rem 0.45rem',
                                  borderRadius:
                                    '0.35rem',
                                  fontWeight: '700'
                                }}
                              >
                                🪙 {task.points} pts
                              </span>

                              {task.due_date && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#92400e',
                                    background: '#fffbeb',
                                    border:
                                      '1px solid #fde68a',
                                    padding:
                                      '0.2rem 0.45rem',
                                    borderRadius:
                                      '0.35rem'
                                  }}
                                >
                                  Due {task.due_date}
                                </span>
                              )}

                              {task.status &&
                                task.status !==
                                  'available' && (
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#1d4ed8',
                                      background: '#eff6ff',
                                      border:
                                        '1px solid #bfdbfe',
                                      padding:
                                        '0.2rem 0.45rem',
                                      borderRadius:
                                        '0.35rem'
                                    }}
                                  >
                                    {task.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      task.status.slice(1)}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => openTask(task)}
                          style={{
                            flexShrink: 0,
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding:
                              '0.6rem 0.9rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Open Task
                        </button>
                      </div>

                      {task.instructions && (
                        <p
                          style={{
                            margin:
                              '1rem 0 0 2rem',
                            color: '#475569',
                            lineHeight: '1.55',
                            fontSize: '0.9rem'
                          }}
                        >
                          {task.instructions}
                        </p>
                      )}

                      {task.files &&
                        task.files.length > 0 && (
                          <div
                            style={{
                              marginTop: '1rem',
                              marginLeft: '2rem',
                              paddingTop: '0.9rem',
                              borderTop:
                                '1px solid #f1f5f9'
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                color: '#334155',
                                marginBottom:
                                  '0.5rem'
                              }}
                            >
                              📎 TASK FILES
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gap: '0.5rem'
                              }}
                            >
                              {task.files.map(
                                (file) => (
                                  <div
                                    key={
                                      file.name
                                    }
                                    style={{
                                      display:
                                        'flex',
                                      alignItems:
                                        'center',
                                      justifyContent:
                                        'space-between',
                                      gap: '0.75rem',
                                      flexWrap:
                                        'wrap',
                                      padding:
                                        '0.65rem',
                                      background:
                                        '#f8fafc',
                                      border:
                                        '1px solid #e2e8f0',
                                      borderRadius:
                                        '0.5rem'
                                    }}
                                  >
                                    <div>
                                      <strong
                                        style={{
                                          color:
                                            '#0f172a',
                                          display:
                                            'block',
                                          fontSize:
                                            '0.85rem'
                                        }}
                                      >
                                        {file.name}
                                      </strong>

                                      <span
                                        style={{
                                          color:
                                            '#64748b',
                                          fontSize:
                                            '0.75rem'
                                        }}
                                      >
                                        {file.type} ·{' '}
                                        {file.size}
                                      </span>
                                    </div>

                                    <div
                                      style={{
                                        display:
                                          'flex',
                                        gap:
                                          '0.4rem'
                                      }}
                                    >
                                      <a
                                        href={
                                          file.url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color:
                                            '#2563eb',
                                          fontSize:
                                            '0.8rem',
                                          fontWeight:
                                            '700',
                                          textDecoration:
                                            'none'
                                        }}
                                      >
                                        Open
                                      </a>

                                      <a
                                        href={
                                          file.url
                                        }
                                        download={
                                          file.name
                                        }
                                        style={{
                                          color:
                                            '#0f172a',
                                          fontSize:
                                            '0.8rem',
                                          fontWeight:
                                            '700',
                                          textDecoration:
                                            'none'
                                        }}
                                      >
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div
                    style={{
                      padding: '3rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      border:
                        '1px dashed #cbd5e1',
                      borderRadius: '0.75rem',
                      color: '#64748b'
                    }}
                  >
                    No tasks match your search.
                  </div>
                )}
              </div>

              {/* ADMIN TASK CREATION */}
              {isAdmin && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border:
                      '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    position: 'sticky',
                    top: '1rem'
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: '#0f172a'
                    }}
                  >
                    ➕ Issue New Learning Task
                  </h3>

                  <form
                    onSubmit={handleAddTask}
                    style={{
                      display: 'grid',
                      gap: '0.75rem'
                    }}
                  >
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) =>
                        setNewTaskTitle(
                          e.target.value
                        )
                      }
                      placeholder="Task title"
                      style={{
                        padding: '0.65rem',
                        borderRadius:
                          '0.4rem',
                        border:
                          '1px solid #cbd5e1'
                      }}
                    />

                    <select
                      required
                      value={selectedCourseId}
                      onChange={(e) =>
                        setSelectedCourseId(
                          e.target.value
                        )
                      }
                      style={{
                        padding: '0.65rem',
                        borderRadius:
                          '0.4rem',
                        border:
                          '1px solid #cbd5e1'
                      }}
                    >
                      <option value="">
                        -- Choose Module --
                      </option>

                      {courses.map((course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.title}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      required
                      value={newTaskPoints}
                      onChange={(e) =>
                        setNewTaskPoints(
                          e.target.value
                        )
                      }
                      placeholder="Points"
                      style={{
                        padding: '0.65rem',
                        borderRadius:
                          '0.4rem',
                        border:
                          '1px solid #cbd5e1'
                      }}
                    />

                    <button
                      type="submit"
                      style={{
                        background:
                          '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius:
                          '0.4rem',
                        padding:
                          '0.7rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Publish Task
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TASK WORKSPACE */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15,23,42,0.65)',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              maxWidth: '1000px',
              margin: '2rem auto',
              background: '#fff',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow:
                '0 20px 50px rgba(0,0,0,0.2)'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom:
                  '1px solid #e2e8f0',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div>
                <div
                  style={{
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textTransform:
                      'uppercase'
                  }}
                >
                  SkillBridge Task Workspace
                </div>

                <h2
                  style={{
                    margin:
                      '0.35rem 0',
                    color: '#0f172a',
                    fontSize: '1.6rem'
                  }}
                >
                  {selectedTask.title}
                </h2>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.9rem'
                  }}
                >
                  🪙 {selectedTask.points} points
                  {selectedTask.due_date
                    ? ` · Due ${selectedTask.due_date}`
                    : ''}
                </div>
              </div>

              <button
                onClick={closeTask}
                aria-label="Close task workspace"
                style={{
                  border: 'none',
                  background:
                    '#f1f5f9',
                  width: '38px',
                  height: '38px',
                  borderRadius:
                    '50%',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns:
                  'minmax(0, 1fr) 300px',
                gap: '1.5rem'
              }}
            >
              <div>
                <section
                  style={{
                    marginBottom:
                      '1.5rem'
                  }}
                >
                  <h3
                    style={{
                      color:
                        '#0f172a',
                      marginTop: 0
                    }}
                  >
                    Task Instructions
                  </h3>

                  <div
                    style={{
                      background:
                        '#f8fafc',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius:
                        '0.75rem',
                      padding:
                        '1rem',
                      color:
                        '#475569',
                      lineHeight:
                        '1.65',
                      whiteSpace:
                        'pre-wrap'
                    }}
                  >
                    {selectedTask.instructions ||
                      'Follow the task requirements and submit your completed work.'}
                  </div>
                </section>

                <section>
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      gap: '1rem',
                      marginBottom:
                        '0.5rem'
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        color:
                          '#0f172a'
                      }}
                    >
                      Your Submission
                    </h3>

                    <button
                      type="button"
                      onClick={loadSavedDraft}
                      style={{
                        border:
                          '1px solid #cbd5e1',
                        background:
                          '#fff',
                        color:
                          '#334155',
                        borderRadius:
                          '0.4rem',
                        padding:
                          '0.45rem 0.7rem',
                        cursor:
                          'pointer',
                        fontSize:
                          '0.8rem',
                        fontWeight:
                          '700'
                      }}
                    >
                      Load Saved Draft
                    </button>
                  </div>

                  <textarea
                    value={submissionText}
                    onChange={(e) =>
                      setSubmissionText(
                        e.target.value
                      )
                    }
                    placeholder="Type or paste your own work here..."
                    style={{
                      width: '100%',
                      minHeight:
                        '300px',
                      boxSizing:
                        'border-box',
                      padding:
                        '0.9rem',
                      borderRadius:
                        '0.7rem',
                      border:
                        '1px solid #cbd5e1',
                      resize:
                        'vertical',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '0.95rem',
                      lineHeight:
                        '1.55'
                    }}
                  />

                  <div
                    style={{
                      marginTop:
                        '0.75rem'
                    }}
                  >
                    <label
                      style={{
                        display:
                          'block',
                        fontWeight:
                          '700',
                        color:
                          '#334155',
                        fontSize:
                          '0.85rem',
                        marginBottom:
                          '0.4rem'
                      }}
                    >
                      Upload Your Work
                    </label>

                    <input
                      type="file"
                      onChange={(e) =>
                        setSubmissionFile(
                          e.target
                            .files?.[0] ||
                            null
                        )
                      }
                      style={{
                        width:
                          '100%'
                      }}
                    />

                    {submissionFile && (
                      <div
                        style={{
                          marginTop:
                            '0.4rem',
                          color:
                            '#475569',
                          fontSize:
                            '0.8rem'
                        }}
                      >
                        Selected:{' '}
                        {
                          submissionFile.name
                        }
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      gap: '0.6rem',
                      flexWrap:
                        'wrap',
                      marginTop:
                        '1rem'
                    }}
                  >
                    <button
                      type="button"
                      onClick={saveDraft}
                      disabled={
                        submissionStatus ===
                        'saving'
                      }
                      style={{
                        border:
                          '1px solid #cbd5e1',
                        background:
                          '#fff',
                        color:
                          '#0f172a',
                        borderRadius:
                          '0.5rem',
                        padding:
                          '0.65rem 1rem',
                        fontWeight:
                          '700',
                        cursor:
                          'pointer'
                      }}
                    >
                      {submissionStatus ===
                      'saving'
                        ? 'Saving...'
                        : 'Save Draft'}
                    </button>

                    <button
                      type="button"
                      onClick={submitTask}
                      disabled={
                        submissionStatus ===
                        'submitting'
                      }
                      style={{
                        border:
                          'none',
                        background:
                          '#2563eb',
                        color:
                          '#fff',
                        borderRadius:
                          '0.5rem',
                        padding:
                          '0.65rem 1rem',
                        fontWeight:
                          '800',
                        cursor:
                          'pointer'
                      }}
                    >
                      {submissionStatus ===
                      'submitting'
                        ? 'Submitting...'
                        : 'Submit Task'}
                    </button>
                  </div>

                  {submissionStatus ===
                    'saved' && (
                    <div
                      style={{
                        marginTop:
                          '0.75rem',
                        color:
                          '#166534',
                        background:
                          '#f0fdf4',
                        border:
                          '1px solid #bbf7d0',
                        borderRadius:
                          '0.5rem',
                        padding:
                          '0.65rem',
                        fontSize:
                          '0.85rem'
                      }}
                    >
                      ✓ Draft saved.
                    </div>
                  )}

                  {submissionStatus ===
                    'submitted' && (
                    <div
                      style={{
                        marginTop:
                          '0.75rem',
                        color:
                          '#1d4ed8',
                        background:
                          '#eff6ff',
                        border:
                          '1px solid #bfdbfe',
                        borderRadius:
                          '0.5rem',
                        padding:
                          '0.65rem',
                        fontSize:
                          '0.85rem'
                      }}
                    >
                      ✓ Task submitted successfully.
                      Your work can now move into
                      the review process.
                    </div>
                  )}

                  {submissionStatus ===
                    'error' && (
                    <div
                      style={{
                        marginTop:
                          '0.75rem',
                        color:
                          '#991b1b',
                        background:
                          '#fef2f2',
                        border:
                          '1px solid #fecaca',
                        borderRadius:
                          '0.5rem',
                        padding:
                          '0.65rem',
                        fontSize:
                          '0.85rem'
                      }}
                    >
                      The submission could not be
                      saved to the database yet.
                    </div>
                  )}
                </section>
              </div>

              {/* FILES PANEL */}
              <aside>
                <div
                  style={{
                    border:
                      '1px solid #e2e8f0',
                    borderRadius:
                      '0.75rem',
                    padding:
                      '1rem',
                    background:
                      '#f8fafc'
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color:
                        '#0f172a'
                    }}
                  >
                    📎 Task Files
                  </h3>

                  <p
                    style={{
                      color:
                        '#64748b',
                      fontSize:
                        '0.8rem',
                      lineHeight:
                        '1.45'
                    }}
                  >
                    These are the files provided with
                    this task. Open them in a new tab
                    or download them to your computer.
                  </p>

                  {selectedTask.files &&
                  selectedTask.files.length >
                    0 ? (
                    <div
                      style={{
                        display:
                          'grid',
                        gap: '0.75rem'
                      }}
                    >
                      {selectedTask.files.map(
                        (file) => (
                          <div
                            key={
                              file.name
                            }
                            style={{
                              background:
                                '#fff',
                              border:
                                '1px solid #e2e8f0',
                              borderRadius:
                                '0.6rem',
                              padding:
                                '0.75rem'
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  'block',
                                color:
                                  '#0f172a',
                                fontSize:
                                  '0.85rem'
                              }}
                            >
                              {file.name}
                            </strong>

                            <div
                              style={{
                                color:
                                  '#64748b',
                                fontSize:
                                  '0.72rem',
                                margin:
                                  '0.25rem 0 0.5rem'
                              }}
                            >
                              {file.type} ·{' '}
                              {file.size}
                            </div>

                            <div
                              style={{
                                display:
                                  'flex',
                                gap:
                                  '0.6rem'
                              }}
                            >
                              <a
                                href={
                                  file.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color:
                                    '#2563eb',
                                  fontSize:
                                    '0.8rem',
                                  fontWeight:
                                    '700',
                                  textDecoration:
                                    'none'
                                }}
                              >
                                Open
                              </a>

                              <a
                                href={
                                  file.url
                                }
                                download={
                                  file.name
                                }
                                style={{
                                  color:
                                    '#0f172a',
                                  fontSize:
                                    '0.8rem',
                                  fontWeight:
                                    '700',
                                  textDecoration:
                                    'none'
                                }}
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        color:
                          '#64748b',
                        fontSize:
                          '0.85rem'
                      }}
                    >
                      No files were attached to this
                      task.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop:
                      '1rem',
                    padding:
                      '1rem',
                    background:
                      '#eff6ff',
                    border:
                      '1px solid #bfdbfe',
                    borderRadius:
                      '0.75rem',
                    color:
                      '#1e3a8a',
                    fontSize:
                      '0.8rem',
                    lineHeight:
                      '1.5'
                  }}
                >
                  <strong>
                    Submission workflow
                  </strong>

                  <div
                    style={{
                      marginTop:
                        '0.5rem'
                    }}
                  >
                    1. Read the instructions
                    <br />
                    2. Open the task files
                    <br />
                    3. Complete your own work
                    <br />
                    4. Save a draft
                    <br />
                    5. Submit the task
                    <br />
                    6. Wait for review
                    <br />
                    7. Approved work can move toward
                    payment
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </SiteChrome>
  );
}
