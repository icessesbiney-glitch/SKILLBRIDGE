'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TasksPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('task_submissions').select('*').order('submitted_at', { ascending: false }).then(({ data }) => {
      if (data) setSubmissions(data);
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setMsg('Please select a file');
    setMsg('Uploading asset file...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated user instance');
      const path = `${user.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadErr } = await supabase.storage.from('task-deliverables').upload(path, file);
      if (uploadErr) throw uploadErr;

      await supabase.from('task_submissions').insert({
        task_id: '00000000-0000-0000-0000-000000000000',
        user_id: user.id,
        notes_text: notes,
        file_storage_path: path,
        file_size_bytes: file.size,
        status: 'Pending Review'
      });
      setMsg('Task uploaded into the ledger successfully!');
    } catch (err: any) {
      setMsg(`Upload runtime failure: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">SkillBridge Task Submission Portal</h2>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
        className="border p-2 w-full" 
      />
      <textarea 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        placeholder="Add transaction task notes..." 
        className="border p-2 w-full" 
      />
      <button onClick={handleUpload} className="bg-blue-600 text-white p-2 w-full">
        Upload File Deliverable
      </button>
      <p className="text-sm font-semibold">{msg}</p>
    </div>
  );
}
