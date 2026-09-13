'use client';

import { useMemo, useState } from 'react';

import { learnerBands, learningResources, taskCatalog } from '../data/siteContent';

export default function TaskWorkspace() {
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'local' | 'public'>('all');
  const [uploads, setUploads] = useState<string[]>([]);

  const filteredTasks = useMemo(() => {
    if (audienceFilter === 'all') {
      return taskCatalog;
    }

    return taskCatalog.filter((task) => task.visibility === audienceFilter || task.visibility === 'all');
  }, [audienceFilter]);

  return (
    <div className="sb-stack">
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
            <article key={task.title} className="sb-card">
              <span className="sb-status-pill">
                {task.level} · ₵{task.pay}
              </span>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <ul className="sb-simple-list">
                <li>Audience: {task.visibility}</li>
                <li>Choose to continue learning or upgrade to the next task band.</li>
                <li>Open to all education levels, including no formal qualification.</li>
              </ul>
            </article>
          ))}
        </div>
      </div>

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
    </div>
  );
}
