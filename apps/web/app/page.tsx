'use client';

import React, { useEffect, useState } from 'react';
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

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states for adding a new course (Only visible to Admins/Instructors)
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    async function loadCatalogAndSecurity() {
      try {
        // 1. Fetch real course modules from your Supabase catalog table
        const { data: catalogData, error: catalogError } = await supabase
          .from('course_catalog')
          .select('*')
          .order('created_at', { ascending: true });

        if (catalogData && !catalogError) {
          setCourses(catalogData);
        }

        // 2. Inspect logged-in session user's administrative level keys
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminRole, error: adminError } = await supabase
            .from('skillbridge_admin_registry')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (adminRole && (adminRole.role === 'academy_admin' || adminRole.role === 'course_instructor')) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error establishing connection with catalog nodes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalogAndSecurity();
  }, []);

  // Built-in Checkout Trigger Logic to process payments via Dodo
  const handleEnrollmentCheckout = async (course: Course) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please sign in or create a SkillBridge account to enroll in this module.');
        window.location.href = '/auth';
        return;
      }

      console.log('Initializing secure SkillBridge checkout session...', {
        product_id: course.id,
        user_id: user.id,
        amount: course.price
      });

      // Redirect the student straight to the live Dodo checkout hosted payment page.
      // It binds the user_id context so your webhook endpoint credits the correct wallet.
      window.location.href = `https://dodopayments.com{course.id}&user_id=${user.id}&customer_email=${encodeURIComponent(user.email || '')}&redirect_url=${encodeURIComponent(window.location.origin + '/dashboard?checkout=success')}`;

    } catch (err) {
      console.error('Dodo execution gateway failure context:', err);
      alert('Failed to connect to the Dodo payment terminal. Please try again.');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCategory || !newPrice) return;

    const { data, error } = await supabase
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
      setCourses([...courses, data]);
      setNewTitle('');
      setNewCategory('');
      setNewPrice('');
      setNewDescription('');
    }
  };

  if (loading) {
    return (
      <SiteChrome>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569', fontWeight: '500' }}>
          Syncing SkillBridge Catalog Infrastructure...
        </div>
      </SiteChrome>
    );
  }

  return (
    <SiteChrome>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            Available Learning Curriculums
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem' }}>
            Select an elite upskilling track to process via your production Dodo Payments terminal account.
          </p>
        </div>

        {/* INSTRUCTOR CONTROLS INTERFACE PANEL */}
        {isAdmin && (
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1d4ed8', marginBottom: '1rem' }}>
              ⚙️ Instructor Course Management Console
            </h2>
            <form onSubmit={handleAddCourse} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Course Title</span>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Full-Stack Engineering" style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Department Category</span>
                <input type="text" required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Cloud Architecture" style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Tuition Fee (GHS)</span>
                <input type="number" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="200" style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Brief Description</span>
                <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Enter details..." style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', height: '38px', fontSize: '0.9rem' }}>
                Publish Module
              </button>
            </form>
          </div>
        )}

        {/* RENDER PRODUCT CATALOG TILES GRID */}
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {courses.map((course) => (
            <div key={course.id} style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                  {course.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '0.75rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  Lead Instructor: <strong style={{ color: '#475569' }}>{course.instructor_name}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  {course.description || 'No syllabus outline detailed for this training block yet.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: '500' }}>TUITION FEE</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
                    {course.price.toFixed(2)} <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>{course.currency}</span>
                  </span>
                </div>
                <button 
                  onClick={() => handleEnrollmentCheckout(course)}
                  style={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '0.875rem', fontWeight: '600', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  Enroll via Dodo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteChrome>
  );
}
