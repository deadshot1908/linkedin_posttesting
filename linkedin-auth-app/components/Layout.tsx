import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl p-6 rounded-r-3xl flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-8">LinkedIn Dashboard</h2>
          <nav>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/accounts"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    router.pathname === '/accounts'
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Accounts
                </Link>
              </li>
              <li>
                <Link
                  href="/post"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    router.pathname === '/post'
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📝 Post
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Optional: Footer in sidebar */}
        <div className="text-xs text-gray-400 mt-10">© 2025 YourApp</div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
