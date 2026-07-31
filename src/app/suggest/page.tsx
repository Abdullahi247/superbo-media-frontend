'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Venue } from '../../lib/types';
import { RequireRole } from '../../components/RequireRole';

/** `datetime-local` min value in the user's local timezone. */
function localDateTimeMin(from = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}T${pad(from.getHours())}:${pad(from.getMinutes())}`;
}

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
  const [minDateTime, setMinDateTime] = useState(() => localDateTimeMin());

  useEffect(() => {
    api<Venue[]>('/venues').then(setVenues).catch(() => undefined);
  }, []);

  // Keep min in sync so the picker can't drift into the past while the form is open.
  useEffect(() => {
    const id = window.setInterval(() => {
      setMinDateTime(localDateTimeMin());
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === venueId) ?? null,
    [venues, venueId],
  );

  function onProposedAtChange(value: string) {
    setProposedAt(value);
    if (value && value < localDateTimeMin()) {
      setError('Proposed date & time must be in the future');
      return;
    }
    if (error === 'Proposed date & time must be in the future') {
      setError('');
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const min = localDateTimeMin();
    setMinDateTime(min);
    if (!proposedAt || proposedAt < min) {
      setError('Proposed date & time must be in the future');
      return;
    }

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
            min={minDateTime}
            value={proposedAt}
            onChange={(e) => onProposedAtChange(e.target.value)}
            className="input-field"
          />
          <p className="mt-1.5 text-xs text-mist-soft">
            Past dates and times can&apos;t be selected.
          </p>
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
