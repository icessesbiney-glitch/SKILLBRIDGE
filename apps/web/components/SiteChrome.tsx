'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import AuthControls from './AuthControls';
import { navigationLinks } from '../data/siteContent';
import { supabase } from '@/utils/supabaseClient'; // Fixed path using global workspace alias

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

  return (
    <div className="sb-shell">
      <header className="sb-topbar">
        <div className="sb-topbar-inner">
          <Link href="/" className="sb-brand">
            SkillBridge
          </Link>
          <nav className="sb-nav" aria-label="Primary">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="sb-nav-link"
                aria-current={isActiveLink(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
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
