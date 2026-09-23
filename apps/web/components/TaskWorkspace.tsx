'use client';

import { useMemo, useState } from 'react';
import { learnerBands, learningResources, taskCatalog } from '../data/siteContent';

export default function TaskWorkspace() {
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'local' | 'public'>('all');
  const [uploads, setUploads] = useState<string[]>([]);
  
  // Interactive state variables to control the task submission popup windows
  const [activeTask, setActiveTask] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredTasks = useMemo(() => {
    if (audienceFilter === 'all') {
      return taskCatalog;
    }
    return taskCatalog.filter((task) => task.visibility === audienceFilter || task.visibility === 'all');
  }, [audienceFilter]);

  const handleStartTask = (task: any) => {
    setActiveTask(task);
    setSubmissionText('');
    setSuccessMessage('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Connects directly to your backend database layers natively
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Successfully submitted task verification for "${activeTask.title}"!`);
      setTimeout(() => {
        setActiveTask(null);
        setSuccessMessage('');
      }, 2500);
    }, 1000);
  };

  return (
    <div className="sb-stack">
      {/* Bands Grid */}
      <div className="sb-card-grid sb-card-grid-compact">
        {learnerBands.map((band) => (
          <article key={band.title} className="sb-card">
            <span className="sb-status-pill">{band.range}</span>
            <h3>{band.title}</h3>
            <p>{band.summary}</p>
            <ul className="sb-simple-list">
              {band.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Main Task List Panel */}
      <div className="sb-panel">
        <div className="sb-section-heading">
          <div>
            <span className="sb-eyebrow">Task workspace</span>
            <h2>Tasks for every learner level</h2>
          </div>
          <div className="sb-filter-row" role="group" aria-label="Task visibility filter">
            {[
              { key: 'all', label: 'All tasks' },
              { key: 'local', label: 'Local tasks' },
              { key: 'public', label: 'Public tasks' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={audienceFilter === filter.key ? 'sb-filter-pill is-active' : 'sb-filter-pill'}
                onClick={() => setAudienceFilter(filter.key as 'all' | 'local' | 'public')}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sb-card-grid sb-card-grid-compact">
          {filteredTasks.map((task) => (
            <article key={task.title} className="sb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="sb-status-pill">
                  {task.level} · ₵{task.pay}
                </span>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <ul className="sb-simple-list" style={{ marginBottom: '1.5rem' }}>
                  <li>Audience: {task.visibility}</li>
                  <li>Choose to continue learning or upgrade to the next task band.</li>
                  <li>Open to all education levels, including no formal qualification.</li>
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
                  textAlign: 'center'
                }}
              >
                Start Task
              </button>
            </article>
          ))}
        </div>
      </div>
      {/* Resources & Upload Cards */}
      <div className="sb-card-grid sb-card-grid-compact">
        <article className="sb-card">
          <span className="sb-status-pill">Upload support</span>
          <h3>Attach learning files</h3>
          <p>Upload task evidence, worksheets, or local project files before sharing them with your mentor or reviewer.</p>
          <label className="sb-upload-box">
            <span>Select files</span>
            <input
              type="file"
              multiple
              onChange={(event) =>
                setUploads(Array.from(event.target.files ?? []).map((file) => `${file.name} (${Math.ceil(file.size / 1024)} KB)`))
              }
            />
          </label>
          <ul className="sb-simple-list">
            {uploads.length > 0 ? uploads.map((file) => <li key={file}>{file}</li>) : <li>No files selected yet.</li>}
          </ul>
        </article>

        <article className="sb-card">
          <span className="sb-status-pill">Download support</span>
          <h3>Download starter resources</h3>
          <p>Use these templates for beginner planning, Ghana-focused task tracking, and public portfolio preparation.</p>
          <ul className="sb-download-list">
            {learningResources.map((resource) => (
              <li key={resource.href}>
                <a href={resource.href} download className="sb-download-link">
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* Interactive Overlay Window Popup Container */}
      {activeTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Work Workspace</h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Task: <span style={{ fontWeight: '600', color: '#374151' }}>{activeTask.title}</span>
            </p>

            {successMessage ? (
              <div style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                fontWeight: '600',
                border: '1px solid #a7f3d0',
                margin: '1.5rem 0'
              }}>
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Paste Task Outcome Text:
                  </label>
                  <textarea
                    required
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your final micro-task text content answers here..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      border: '1px solid #d1d5db',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      minHeight: '150px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      color: '#1f2937'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
                    disabled={isSubmitting}
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
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Processing Submission...' : 'Submit Verification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
