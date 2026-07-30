'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/format';
import type { EventItem, Venue } from '../../lib/types';

interface QueueResponse {
  venues: Venue[];
  items: EventItem[];
}

export default function QueuePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api<QueueResponse>('/events/queue');
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'VENUE_MANAGER') {
      router.replace('/');
      return;
    }
    load();
  }, [user, authLoading, router, load]);

  async function decide(id: string, status: 'APPROVED' | 'REJECTED') {
    setActing(id);
    setError('');
    try {
      await api(`/events/${id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decision failed');
    } finally {
      setActing(null);
    }
  }

  if (authLoading || (!user && loading)) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-mist">Loading…</div>
    );
  }

  const items = data?.items ?? [];
  const venues = data?.venues ?? user?.venues ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps">Venue manager</p>
          <h1 className="mt-2 heading-display">
            Approval queue
            <span className="ml-3 align-middle rounded-full border border-ink-line bg-ink-muted/50 px-2.5 py-1 text-[10px] font-sans font-medium uppercase tracking-wider text-mist-soft">
              Project preview
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-mist">
            {venues.length === 0
              ? 'No venues assigned yet — pending suggestions ranked by upvotes, highest first.'
              : `Managing ${venues.map((v) => v.name).join(', ')}. Pending suggestions ranked by upvotes, highest first.`}
          </p>
        </div>
        <Link href="/" className="btn-ghost text-xs uppercase tracking-wider">
          View board
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Pending ({items.length})
        </h2>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {loading && (
          <div className="surface mt-4 px-6 py-12 text-center text-mist">
            Loading queue…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="surface mt-4 px-6 py-14 text-center text-mist">
            Queue is clear. Nothing waiting on you.
          </div>
        )}

        <div className="mt-4 grid gap-4">
          {items.map((event, index) => (
            <article key={event.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3 text-xs text-mist-soft">
                    <span className="font-display text-lg font-bold text-ember">
                      #{index + 1}
                    </span>
                    <span>{event.venue?.name}</span>
                    <span>·</span>
                    <span>{event.upvoteCount} upvotes</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    {event.description}
                  </p>
                  <p className="mt-3 text-xs text-mist-soft">
                    {formatDate(event.proposedAt)}
                    {event.author ? ` · ${event.author.name}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={acting === event.id}
                    onClick={() => decide(event.id, 'REJECTED')}
                    className="btn-ghost !px-4 !py-2 text-xs uppercase tracking-wider"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={acting === event.id}
                    onClick={() => decide(event.id, 'APPROVED')}
                    className="btn-primary !px-4 !py-2 text-xs uppercase tracking-wider"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
