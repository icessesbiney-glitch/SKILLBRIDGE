'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

type Task = {
  id: string;
  title: string;
  description: string;
  level: string;
  pay: number;
  visibility: 'local' | 'public' | 'all';
};

export default function TaskWorkspace() {
  const [audienceFilter, setAudienceFilter] = useState<
    'all' | 'local' | 'public'
  >('all');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState('');

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    async function loadTasks() {
      if (!supabase) {
        setTaskError('Task services are not configured. Please try again later.');
        setIsLoadingTasks(false);
        return;
      }

      setIsLoadingTasks(true);
      setTaskError('');

      try {
        const { data, error } = await supabase
          .from('task_catalog')
          .select('id, title, description, level, pay, visibility')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTasks((data ?? []) as Task[]);
      } catch (error) {
        console.error('Task catalog request failed:', error);
        setTaskError('We could not load the available tasks.');
        setTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    }

    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (audienceFilter === 'all') {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.visibility === audienceFilter || task.visibility === 'all',
    );
  }, [audienceFilter, tasks]);

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    setSubmissionText('');
    setSuccessMessage('');
    setSubmissionError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTask) {
      return;
    }

    if (!supabase) {
      setSubmissionError('Task services are not configured. Please try again later.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');
    setSuccessMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error('You must be signed in before submitting a task.');
      }

      const cleanedText = submissionText.trim();

      if (!cleanedText) {
        throw new Error('Please enter your task work before submitting.');
      }
      if (cleanedText.length > 10000) {
        throw new Error('Please keep your submission under 10,000 characters.');
      }

      const { error: submissionInsertError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: activeTask.id,
          applicant_id: user.id,
          submission_text: cleanedText,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        });

      if (submissionInsertError) {
        throw new Error(submissionInsertError.message);
      }

      setSuccessMessage(
        `Your submission for "${activeTask.title}" was sent successfully.`,
      );
      setSubmissionText('');
    } catch (error) {
      console.error('Task submission error:', error);

      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while submitting your task.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sb-stack">
      {/* Task catalog */}
      <div className="sb-panel">
        <div className="sb-section-heading">
          <div>
            <span className="sb-eyebrow">Marketplace</span>

            <h2>Browse available work</h2>
          </div>

          <div
            className="sb-filter-row"
            role="group"
            aria-label="Task visibility filter"
          >
            {[
              { key: 'all', label: 'All tasks' },
              { key: 'local', label: 'Local tasks' },
              { key: 'public', label: 'Public tasks' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={
                  audienceFilter === filter.key
                    ? 'sb-filter-pill is-active'
                    : 'sb-filter-pill'
                }
                onClick={() =>
                  setAudienceFilter(
                    filter.key as 'all' | 'local' | 'public',
                  )
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingTasks && (
          <div className="sb-card">
            <h3>Loading available tasks...</h3>
            <p>Please wait while SkillBridge loads the live task catalog.</p>
          </div>
        )}

        {!isLoadingTasks && taskError && (
          <div className="sb-card">
            <span className="sb-status-pill">Task loading error</span>

            <h3>Tasks could not be loaded</h3>

            <p>{taskError}</p>
          </div>
        )}

        {!isLoadingTasks && !taskError && filteredTasks.length === 0 && (
          <div className="sb-card">
            <span className="sb-status-pill">No tasks yet</span>

            <h3>No tasks match this filter</h3>

            <p>
              Try another task filter or return later when more tasks are
              published.
            </p>
          </div>
        )}

        {!isLoadingTasks && !taskError && filteredTasks.length > 0 && (
          <div className="sb-card-grid sb-card-grid-compact">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className="sb-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span className="sb-status-pill">
                    {task.level} · ₵{Number(task.pay).toFixed(2)}
                  </span>

                  <h3>{task.title}</h3>

                  <p>{task.description}</p>

                  <ul
                    className="sb-simple-list"
                    style={{ marginBottom: '1.5rem' }}
                  >
                    <li>
                      Audience:{' '}
                      {task.visibility === 'all'
                        ? 'Everyone'
                        : task.visibility}
                    </li>

                    <li>
                      Complete the task and submit your own work for review.
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartTask(task)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    marginTop: 'auto',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Start Task
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Real task workspace */}
      {activeTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              padding: '1.5rem',
              maxWidth: '700px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <span className="sb-status-pill">
              {activeTask.level} · ₵
              {Number(activeTask.pay).toFixed(2)}
            </span>

            <h3
              style={{
                marginTop: '0.75rem',
                marginBottom: '0.5rem',
                color: '#111827',
              }}
            >
              {activeTask.title}
            </h3>

            <p
              style={{
                marginBottom: '1.5rem',
                color: '#4b5563',
              }}
            >
              {activeTask.description}
            </p>

            {successMessage && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  border: '1px solid #a7f3d0',
                  marginBottom: '1.5rem',
                }}
              >
                {successMessage}
              </div>
            )}

            {submissionError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  border: '1px solid #fecaca',
                  marginBottom: '1.5rem',
                }}
              >
                {submissionError}
              </div>
            )}

            {!successMessage && (
              <form
                onSubmit={handleFormSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    htmlFor="task-submission-text"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    Your task work
                  </label>

                  <textarea
                    id="task-submission-text"
                    required
                    value={submissionText}
                    maxLength={10000}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Paste or type your completed task work here..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      border: '1px solid #d1d5db',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      minHeight: '220px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      color: '#1f2937',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    disabled={isSubmitting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.6rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : 'Submit Task for Review'}
                  </button>
                </div>
              </form>
            )}

            {successMessage && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTask(null);
                    setSuccessMessage('');
                  }}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Close Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
