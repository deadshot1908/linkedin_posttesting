// components/Layout.tsx
import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', backgroundColor: '#f0f2f5', padding: '20px' }}>
        <h2 style={{ color: '#1976d2', marginBottom: '40px' }}>LinkedIn Dashboard</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/accounts" style={{ textDecoration: 'none', color: '#333' }}>
                <span style={{ marginRight: '8px' }}>👤</span> Accounts
              </Link>
            </li>
            <li>
              <Link href="/post" style={{ textDecoration: 'none', color: '#333' }}>
                <span style={{ marginRight: '8px' }}>📝</span> Post
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ padding: '40px', flexGrow: 1, backgroundColor: '#fff' }}>{children}</div>
    </div>
  );
}
