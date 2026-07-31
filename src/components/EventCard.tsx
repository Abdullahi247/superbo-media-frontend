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
  index?: number;
}

export function EventCard({ event, onChange, index = 0 }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [popping, setPopping] = useState(false);

  async function toggleVote() {
    if (!user) {
      setError('Sign in as a customer to upvote');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      setError('Only customers can upvote');
      return;
    }
    if (event.status === 'REJECTED') {
      setError('You can not upvote an already rejected venue');
      return;
    }

    setBusy(true);
    setError('');
    setPopping(true);
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
      window.setTimeout(() => setPopping(false), 350);
    }
  }

  const canVote = user?.role === 'CUSTOMER' && event.status !== 'REJECTED';
  const voteDisabled = busy || !canVote;

  return (
    <article
      className="surface surface-interactive group p-5 animate-stagger"
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-transform duration-200 group-hover:scale-[1.03] ${statusStyles[event.status]}`}
            >
              {statusLabel(event.status)}
            </span>
            {event.venue && (
              <span className="text-xs text-mist-soft transition-colors duration-200 group-hover:text-mist">
                {event.venue.name}
                {event.venue.capacity != null
                  ? ` · cap. ${event.venue.capacity}`
                  : ''}
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-white transition-colors duration-200 group-hover:text-ember-bright/95">
            {event.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            {event.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist-soft">
            <span>{formatDate(event.proposedAt)}</span>
            {event.author && <span>pitched by {event.author.name}</span>}
          </div>
          {error && (
            <p className="mt-2 animate-fade-in text-xs text-red-300">{error}</p>
          )}
          {user?.role === 'VENUE_MANAGER' && (
            <p className="mt-2 text-xs text-mist-soft">
              Managers can&apos;t upvote — use the approval queue instead.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={voteDisabled}
          onClick={toggleVote}
          title={
            !user
              ? 'Sign in as a customer to upvote'
              : user.role !== 'CUSTOMER'
                ? 'Only customers can upvote'
                : event.status === 'REJECTED'
                  ? 'You can not upvote an already rejected venue'
                  : undefined
          }
          className={`vote-btn ${event.hasVoted ? 'vote-btn-on' : 'vote-btn-off'} ${
            popping ? 'vote-pop' : ''
          } ${busy ? 'opacity-70' : ''} ${
            !canVote ? 'cursor-not-allowed opacity-60' : ''
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
            className={`mb-1 transition-transform duration-200 ${
              event.hasVoted ? '-translate-y-0.5' : ''
            }`}
          >
            <path
              d="M12 19V5M5 12l7-7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-xl font-bold leading-none tabular-nums">
            {event.upvoteCount}
          </span>
        </button>
      </div>
    </article>
  );
}
