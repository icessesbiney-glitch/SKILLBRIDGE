import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="sb-section">
      <div className="sb-container">
        <div className="sb-panel">
          <h1>Page not found</h1>
          <p>The page may have moved or is not available.</p>
          <Link href="/" className="sb-button">Return to SkillBridge</Link>
        </div>
      </div>
    </main>
  );
}
