import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://supabase.co', 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo');
export default function SkillBridgeAuthAndPathPortal() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null); const [courses, setCourses] = useState([]);
  const [completedModules, setCompletedModules] = useState([]); const [walletBalance, setWalletBalance] = useState(0.00);
  const paths = [
    { id: 'PATH_DEV', title: 'Decentralized Material Dealership & Vendor Hubs', description: 'Master inventory ledgers, Paystack micro-transactions, and Supabase security matrix profiles.' },
    { id: 'PATH_LOGISTICS', title: 'Hyperlocal Dispatch & Telemetry Fleet Management', description: 'Orchestrate real-time active rider location mapping, pool lease controls, and edge router load boundaries.' }
  ];
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null); if (session?.user) fetchUserProgress(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null); if (session?.user) fetchUserProgress(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);
  const fetchUserProgress = async (userId) => {
    const { data } = await supabase.from('user_learning_profiles').select('*').eq('user_id', userId).single();
    if (data) {
      setSelectedPath(data.selected_path); setCompletedModules(data.completed_modules || []);
      setWalletBalance(data.wallet_balance || 0.00); fetchPathCourses(data.selected_path);
    } else {
      await supabase.from('user_learning_profiles').insert([{ user_id: userId, wallet_balance: 0.00, completed_modules: [] }]);
    }
  };
  const handleSignUp = async (e) => {
    e.preventDefault(); const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message); else alert('Registration successful! Check email.');
  };
  const handleSignIn = async (e) => {
    e.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };
  const handlePathSelection = async (pathId) => {
    setSelectedPath(pathId); if (user) { await supabase.from('user_learning_profiles').update({ selected_path: pathId }).eq('user_id', user.id); }
    fetchPathCourses(pathId);
  };
  const fetchPathCourses = (pathId) => {
    if (pathId === 'PATH_DEV') {
      setCourses([{ id: 'C_DEV_01', name: 'Prisma Layer & Row Level Security Mapping', value: 30 }, { id: 'C_DEV_02', name: 'Paystack Transaction Ledger Stream Processing', value: 50 }]);
    } else {
      setCourses([{ id: 'C_LOG_01', name: 'Accra Fleet Active GPS Coordination', value: 40 }, { id: 'C_LOG_02', name: 'Database Pool Connection Threshold Auditing', value: 45 }]);
    }
  };
  const triggerModuleAudit = async (courseId, valueGHS) => {
    if (!completedModules.includes(courseId)) {
      const updatedModules = [...completedModules, courseId]; const updatedBalance = walletBalance + valueGHS;
      setCompletedModules(updatedModules); setWalletBalance(updatedBalance);
      if (user) { await supabase.from('user_learning_profiles').update({ completed_modules: updatedModules, wallet_balance: updatedBalance }).eq('user_id', user.id); }
    }
  };
  if (loading) return <div>Authenticating...</div>;
  return (
    <div style={{ padding: '32px' }}>
      {!user ? (
        <div>
          <h2>🔐 SKILLBRIDGE AUTH PORTAL</h2>
          <input type='email' placeholder='email' onChange={e => setEmail(e.target.value)} />
          <input type='password' placeholder='password' onChange={e => setPassword(e.target.value)} />
          <button onClick={handleSignIn}>SIGN IN</button>
          <button onClick={handleSignUp}>REGISTER</button>
        </div>
      ) : (
        <div>
          <header>
            <p>ACCOUNT: {user.email}</p>
            <p>VERIFIED WALLET BALANCE: {walletBalance.toFixed(2)} GHS</p>
          </header>
          {!selectedPath ? (
            <div>
              <h2>Choose Your Specialized Microservice Path:</h2>
              {paths.map(p => (
                <div key={p.id}>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <button onClick={() => handlePathSelection(p.id)}>ACTIVATE PATHWAY</button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div>
                <h2>Pathway Status</h2>
                <h3>{selectedPath === 'PATH_DEV' ? 'Decentralized Vendor Platform' : 'Hyperlocal Fleet Tracker'}</h3>
                <button onClick={() => setSelectedPath(null)}>Change Track</button>
              </div>
              <div>
                <h2>Available Modules & Audits</h2>
                {courses.map(c => {
                  const isDone = completedModules.includes(c.id);
                  return (
                    <div key={c.id}>
                      <p>{c.name} ({c.value}.00 GHS)</p>
                      <button onClick={() => triggerModuleAudit(c.id, c.value)} disabled={isDone}>{isDone ? 'VERIFIED' : 'RUN AUDIT'}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
  const [p, setP] = useState({ path: null, modules: [] });
