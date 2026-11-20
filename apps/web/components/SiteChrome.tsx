'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import AuthControls from './AuthControls';

type SiteChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname() ?? '';

  return (
    <div className="sb-shell">
      <header className="sb-topbar">
        <div className="sb-topbar-inner">
          <Link href="/" className="sb-brand">SkillBridge</Link>
          <nav className="sb-nav" aria-label="Primary">
            {navigation.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="sb-nav-link"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <AuthControls />
        </div>
      </header>
      <main>{children}</main>
      <footer className="sb-footer">
        <div className="sb-footer-inner">
          <div>
            <p className="sb-footer-title">SkillBridge</p>
            <p className="sb-footer-copy">
              Account, wallet, and marketplace services for customers and vendors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
