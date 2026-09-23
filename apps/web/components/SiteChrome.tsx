'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import AuthControls from './AuthControls';
import { supabase } from '../utils/supabaseClient';

type SiteChromeProps = {
  children: React.ReactNode;
};

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? '';
  const isActiveLink = (href: string) =>
    currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`));

  // 1. Establish the interactive live sync hooks for your SkillBridge balance
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkillBridgeBalance() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('skillbridge_balance')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setBalance(Number(data.skillbridge_balance).toFixed(2));
          }
        }
      } catch (err) {
        console.error('Error syncing SkillBridge balance ledger:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSkillBridgeBalance();

    // Establish live real-time subscription channels for instant wallet ticks
    const channel = supabase
      .channel('sb-balance-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && 'skillbridge_balance' in payload.new) {
            setBalance(Number(payload.new.skillbridge_balance).toFixed(2));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Defined isolated menu links strictly for SkillBridge
  const skillBridgeLinks = [
    { href: '/roadmap', label: 'Business Roadmap' },
    { href: '/enterprise', label: 'Enterprise Hub' },
    { href: '/registry', label: 'Skills Registry' },
    { href: '/portal', label: 'Partner Portal' }
  ];

  return (
    <div className="sb-shell">
      <header className="sb-topbar">
        <div className="sb-topbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link href="/" className="sb-brand" style={{ fontWeight: '800', color: '#2563eb', fontSize: '1.25rem', textDecoration: 'none' }}>
            SkillBridge
          </Link>
          
          {/* Separated and centered navigation menus */}
          <nav className="sb-nav" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {skillBridgeLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  className="sb-nav-link"
                  aria-current={isActiveLink(link.href) ? 'page' : undefined}
                  style={{
                    textDecoration: 'none',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    color: isActiveLink(link.href) ? '#1e40af' : '#475569',
                    fontWeight: isActiveLink(link.href) ? '700' : '500',
                    fontSize: '0.875rem'
                  }}
                >
                  {link.label}
                </Link>
                {/* Visual Separator Bar between menus (stops before last item) */}
                {index < skillBridgeLinks.length - 1 && (
                  <span style={{ color: '#cbd5e1', userSelect: 'none' }}>|</span>
                )}
              </React.Fragment>
            ))}
          </nav>
          
          {/* 2. Embedded live ledger value wrapper using clean native styles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.375rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              border: '1px solid rgba(13, 148, 136, 0.2)'
            }}>
              {loading ? 'Syncing...' : `${balance} GHS`}
            </div>
            <AuthControls />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="sb-footer">
        <div className="sb-footer-inner">
          <div>
            <p className="sb-footer-title">SkillBridge repository recovery</p>
            <p className="sb-footer-copy">
              A clearer structure for web, desktop, mobile, and deployment work.
            </p>
          </div>
          <p className="sb-footer-copy">Keep shipping from one shared workspace.</p>
        </div>
      </footer>
    </div>
  );
}
