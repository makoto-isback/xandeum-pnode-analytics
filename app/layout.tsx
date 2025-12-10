import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Xandeum pNode Analytics Platform',
  description:
    'Real-time analytics dashboard for Xandeum storage-layer providers (pNodes). Monitor uptime, latency, and performance metrics.',
  keywords: [
    'Xandeum',
    'pNode',
    'Analytics',
    'Dashboard',
    'Storage Providers',
    'Real-time Monitoring',
  ],
  authors: [{ name: 'Xandeum Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Xandeum pNode Analytics Platform',
    description:
      'Monitor and analyze Xandeum pNodes in real-time with our analytics dashboard.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">X</span>
                </div>
                <h1 className="text-xl font-bold">pNode Analytics</h1>
              </div>
              <nav className="flex gap-6">
                <a
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="https://xandeum.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Docs
                </a>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">About</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Xandeum pNode Analytics Platform provides real-time monitoring and
                  analytics for Xandeum storage providers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://xandeum.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Xandeum Docs
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://discord.gg/uqRSmmM5m"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Discord Community
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: Operational
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>&copy; 2025 Xandeum pNode Analytics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
