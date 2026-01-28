'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div
          className={`text-center max-w-2xl transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="mb-8">
            <h1 className="text-7xl sm:text-8xl font-extralight tracking-tighter">
              void
            </h1>
            <div className="h-px w-16 bg-gray-300 dark:bg-gray-700 mx-auto mt-4" />
          </div>

          <p className="text-xl sm:text-2xl font-light text-gray-500 mb-4">
            Minimalist task management
          </p>
          <p className="text-gray-400 mb-12 max-w-md mx-auto">
            Clear your mind. Focus on what matters. Your tasks, protected and private,
            stored only on your device.
          </p>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4"
          >
            Get Started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        <div
          className={`grid sm:grid-cols-3 gap-8 mt-24 max-w-4xl w-full px-4 transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">PIN Protected</h3>
            <p className="text-sm text-gray-400">
              Your tasks are secured with a 4-digit PIN that only you know
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">Offline First</h3>
            <p className="text-sm text-gray-400">
              Everything stays on your device. No accounts, no cloud, no tracking
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">Zero Distractions</h3>
            <p className="text-sm text-gray-400">
              A clean interface that lets you focus purely on your tasks
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>Built for focus. Free forever.</p>
      </footer>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gray-100 dark:bg-gray-900 rounded-full blur-3xl transition-opacity duration-1000 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-100 dark:bg-gray-900 rounded-full blur-3xl transition-opacity duration-1000 delay-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
}
