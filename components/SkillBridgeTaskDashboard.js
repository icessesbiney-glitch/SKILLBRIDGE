import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const payoutByStatus = {
  Basic: 20,
  Intermediate: 100,
  Tertiary: 400,
};

export default function SkillBridgeTaskDashboard({ studentId, studentStatus = 'Basic' }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const taskPayout = payoutByStatus[studentStatus] || payoutByStatus.Basic;

  const handleTaskSubmit = async (taskName) => {
    setMessage('');

    if (!supabase) {
      setMessage('Supabase is not configured. Add the public Supabase environment variables to submit tasks.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('student_tasks').insert({
      student_id: studentId,
      task_name: taskName,
      payout_amount: taskPayout,
      payment_status: 'Pending',
    });
    setLoading(false);

    setMessage(error
      ? `Error logging task: ${error.message}`
      : `Task submitted. ₵${taskPayout.toFixed(2)} is now pending admin review.`);
  };

  return (
    <section className="cockpit" aria-labelledby="cockpit-title">
      <div className="cockpit-header">
        <h2 id="cockpit-title">SkillBridge Learning Cockpit</h2>
        <span className="level-badge">Level: {studentStatus}</span>
      </div>

      <div className="task-card">
        <p>Your Active Task: <strong>Complete Practical Training Module 1</strong></p>
        <p className="reward">Completion Reward: ₵{taskPayout.toFixed(2)} GHS</p>
        <button
          type="button"
          onClick={() => handleTaskSubmit('Completed Technical Module 1 Project')}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Mark Task as Completed'}
        </button>
        {message && <p className="task-message" role="status">{message}</p>}
      </div>
    </section>
  );
}
