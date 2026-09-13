import Link from 'next/link';

import { navigationLinks } from '../data/siteContent';

type SiteChromeProps = {
  children: React.ReactNode;
};

export default function SiteChrome({ children }: SiteChromeProps) {
  return (
    <div className="sb-shell">
      <header className="sb-topbar">
        <div className="sb-topbar-inner">
          <Link href="/" className="sb-brand">
            SkillBridge
          </Link>
          <nav className="sb-nav" aria-label="Primary">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="sb-nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
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
