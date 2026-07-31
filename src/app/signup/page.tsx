'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import type { UserRole } from '../../lib/types';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [venueName, setVenueName] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [venueCapacity, setVenueCapacity] = useState('100');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await signup({
        name,
        email,
        password,
        role,
        venueName: role === 'VENUE_MANAGER' ? venueName : undefined,
        venueLocation: role === 'VENUE_MANAGER' ? venueLocation : undefined,
        venueCapacity:
          role === 'VENUE_MANAGER' ? Number(venueCapacity) : undefined,
      });
      router.push(user.role === 'VENUE_MANAGER' ? '/queue' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-16">
      <p className="label-caps">Join Superbo</p>
      <h1 className="mt-2 heading-display">Create account</h1>
      <p className="mt-3 text-sm text-mist">
        Pick a role — customers pitch nights, managers run the approval queue.
      </p>

      <form onSubmit={onSubmit} className="surface mt-8 space-y-4 p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(245,154,42,0.08)]">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Email
          </label>
          <input
            type="email"
            required
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-mist">I am a…</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['CUSTOMER', 'Customer'],
                ['VENUE_MANAGER', 'Venue manager'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  role === value
                    ? 'border-ember bg-ember/15 text-ember-bright scale-[1.02]'
                    : 'border-ink-line text-mist hover:border-ember/30 hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {role === 'VENUE_MANAGER' && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist">
                Venue name
              </label>
              <input
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="input-field"
                placeholder="The Velvet Room"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist">
                Location (optional)
              </label>
              <input
                value={venueLocation}
                onChange={(e) => setVenueLocation(e.target.value)}
                className="input-field"
                placeholder="Shoreditch"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist">
                Capacity
              </label>
              <input
                type="number"
                required
                min={1}
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(e.target.value)}
                className="input-field"
                placeholder="100"
              />
              <p className="mt-1.5 text-xs text-mist-soft">
                Shown to customers when they pitch an event at your venue.
              </p>
            </div>
          </>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist-soft">
        Already have an account?{' '}
        <Link href="/login" className="link-ember">
          Sign in
        </Link>
      </p>
    </div>
  );
}
