'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Venue } from '../../lib/types';
import { RequireRole } from '../../components/RequireRole';

function SuggestForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedAt, setProposedAt] = useState('');
  const [venueId, setVenueId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Venue[]>('/venues').then(setVenues).catch(() => undefined);
  }, []);

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === venueId) ?? null,
    [venues, venueId],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          proposedAt: new Date(proposedAt).toISOString(),
          venueId,
        }),
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-14 sm:py-20">
      <p className="label-caps">New suggestion</p>
      <h1 className="mt-2 heading-display">Pitch the night</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist">
        Submitting adds your idea to the board as Pending and places it in the
        target venue manager&apos;s approval queue immediately.
      </p>

      <form
        onSubmit={onSubmit}
        className="surface mt-8 space-y-5 p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(245,154,42,0.08)]"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Title
          </label>
          <input
            required
            minLength={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Vinyl-only soul night"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Description
          </label>
          <textarea
            required
            minLength={10}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-y"
            placeholder="What happens, who it's for, and why this venue."
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Proposed date &amp; time
          </label>
          <input
            type="datetime-local"
            required
            value={proposedAt}
            onChange={(e) => setProposedAt(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist">
            Target venue
          </label>
          <select
            required
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="input-field"
          >
            <option value="">Choose a venue…</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.location ? ` — ${v.location}` : ''}
                {v.capacity != null ? ` (cap. ${v.capacity})` : ''}
              </option>
            ))}
          </select>
          {selectedVenue && (
            <p className="mt-2 rounded-lg border border-ember/25 bg-ember/10 px-3 py-2 text-sm text-ember-bright animate-fade-in">
              Capacity at <span className="text-white">{selectedVenue.name}</span>
              :{' '}
              <strong className="font-display text-lg tracking-wide">
                {selectedVenue.capacity}
              </strong>{' '}
              people
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !user}
          className="btn-primary w-full"
        >
          {busy ? 'Submitting…' : 'Submit to venue queue'}
        </button>
      </form>
    </div>
  );
}

export default function SuggestPage() {
  return (
    <RequireRole role="CUSTOMER">
      <SuggestForm />
    </RequireRole>
  );
}
