'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { formatDate, statusLabel } from '../lib/format';
import type { EventItem } from '../lib/types';
import { useAuth } from '../lib/auth';

const statusStyles: Record<string, string> = {
  PENDING: 'border-ember/30 bg-ember/10 text-ember-bright',
  APPROVED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  REJECTED: 'border-red-400/30 bg-red-500/10 text-red-300',
};

interface Props {
  event: EventItem;
  onChange?: (event: EventItem) => void;
}

export function EventCard({ event, onChange }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function toggleVote() {
    if (!user) {
      setError('Sign in as a customer to upvote');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      setError('Only customers can upvote');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await api<{ upvoteCount: number; hasVoted: boolean }>(
        `/events/${event.id}/upvote`,
        { method: event.hasVoted ? 'DELETE' : 'POST' },
      );
      onChange?.({
        ...event,
        upvoteCount: res.upvoteCount,
        hasVoted: res.hasVoted,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update vote');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="surface group p-5 transition hover:border-ember/25">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[event.status]}`}
            >
              {statusLabel(event.status)}
            </span>
            {event.venue && (
              <span className="text-xs text-mist-soft">{event.venue.name}</span>
            )}
          </div>
          <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
            {event.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            {event.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist-soft">
            <span>{formatDate(event.proposedAt)}</span>
            {event.author && <span>pitched by {event.author.name}</span>}
          </div>
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={toggleVote}
          className={`flex min-w-[4.5rem] flex-col items-center rounded-lg border px-3 py-2 transition ${
            event.hasVoted
              ? 'border-ember bg-ember/15 text-ember-bright'
              : 'border-ink-line bg-ink/40 text-mist hover:border-ember/40 hover:text-white'
          }`}
          aria-label={event.hasVoted ? 'Remove upvote' : 'Upvote'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={event.hasVoted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className="mb-1"
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-xl font-bold leading-none">
            {event.upvoteCount}
          </span>
        </button>
      </div>
    </article>
  );
}
