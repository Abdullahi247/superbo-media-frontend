'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      router.push(user.role === 'VENUE_MANAGER' ? '/queue' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-16">
      <p className="label-caps">Superbo access</p>
      <h1 className="mt-2 heading-display">Welcome back</h1>
      <p className="mt-3 text-sm text-mist">
        Customers suggest and upvote. Venue managers approve the queue.
      </p>

      <form onSubmit={onSubmit} className="surface mt-8 space-y-4 p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(245,154,42,0.08)]">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist-soft">
        No account yet?{' '}
        <Link href="/signup" className="link-ember">
          Create one
        </Link>
      </p>

      <p className="mt-8 rounded-lg border border-ink-line/60 bg-ink-soft/40 px-4 py-3 text-xs leading-relaxed text-mist-soft">
        Demo: <span className="text-mist">customer@superbo.local</span> or{' '}
        <span className="text-mist">manager@superbo.local</span> — password{' '}
        <span className="text-mist">password123</span>
      </p>
    </div>
  );
}
