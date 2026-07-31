'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/format';
import type { EventItem, EventStatus, QueueResponse, Venue } from '../../lib/types';
import { RequireRole } from '../../components/RequireRole';

function QueueContent() {
  const { user, refresh } = useAuth();
  const [pending, setPending] = useState<EventItem[]>([]);
  const [rejected, setRejected] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'PENDING' | 'REJECTED'>('PENDING');
  const [showAddVenue, setShowAddVenue] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingRes, rejectedRes, mine] = await Promise.all([
        api<QueueResponse>('/events/queue?status=PENDING'),
        api<QueueResponse>('/events/queue?status=REJECTED'),
        api<Venue[]>('/venues/mine'),
      ]);
      setPending(pendingRes.items ?? []);
      setRejected(rejectedRes.items ?? []);
      setVenues(mine.length ? mine : pendingRes.venues ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue');
      setPending([]);
      setRejected([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(
    id: string,
    status: Extract<EventStatus, 'APPROVED' | 'REJECTED'>,
  ) {
    setActing(id);
    setError('');
    try {
      await api(`/events/${id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (status === 'REJECTED') {
        setMobileTab('REJECTED');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decision failed');
    } finally {
      setActing(null);
    }
  }

  async function onVenueAdded(venue: Venue) {
    setVenues((prev) =>
      [...prev, venue].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setShowAddVenue(false);
    await refresh();
    await load();
  }

  const managedVenues = venues.length ? venues : user?.venues ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps">Venue manager</p>
          <h1 className="mt-2 heading-display">Approval queue</h1>
          <p className="mt-3 max-w-xl text-sm text-mist">
            Pending is ranked by upvotes. Rejected suggestions stay in the
            Rejected column. Add more venues anytime — customers can pitch to
            them on the board.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowAddVenue((v) => !v)}
            className="btn-primary text-xs uppercase tracking-wider"
          >
            {showAddVenue ? 'Close form' : 'Add venue'}
          </button>
          <Link href="/" className="btn-ghost text-xs uppercase tracking-wider">
            View board
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">
            Your venues
          </h2>
          <span className="text-xs text-mist-soft">
            {managedVenues.length} total
          </span>
        </div>

        {managedVenues.length === 0 ? (
          <div className="surface px-5 py-8 text-center text-sm text-mist">
            No venues yet. Add your first room so customers can pitch nights.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {managedVenues.map((v) => (
              <div key={v.id} className="surface px-4 py-3">
                <p className="font-medium text-white">{v.name}</p>
                <p className="mt-1 text-xs text-mist-soft">
                  {v.location || 'No location'}
                  {v.capacity != null ? ` · Cap. ${v.capacity}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {showAddVenue && (
          <AddVenueForm
            onAdded={onVenueAdded}
            onCancel={() => setShowAddVenue(false)}
          />
        )}
      </section>

      {error && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {/* Mobile tab switcher */}
      <div className="mt-8 flex rounded-lg border border-ink-line bg-ink-soft/60 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('PENDING')}
          className={`filter-chip flex-1 text-center ${
            mobileTab === 'PENDING' ? 'filter-chip-active' : 'text-mist'
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('REJECTED')}
          className={`filter-chip flex-1 text-center ${
            mobileTab === 'REJECTED' ? 'filter-chip-active' : 'text-mist'
          }`}
        >
          Rejected ({rejected.length})
        </button>
      </div>

      {loading ? (
        <div className="surface loading-pulse mt-6 px-6 py-16 text-center text-mist">
          Loading queue…
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Pending column */}
          <section
            className={`${
              mobileTab === 'PENDING' ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="mb-4 flex items-center justify-between border-b border-ink-line pb-3">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                Pending
              </h2>
              <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 text-[11px] font-semibold text-ember-bright">
                {pending.length}
              </span>
            </div>
            {pending.length === 0 ? (
              <div className="surface px-5 py-12 text-center text-sm text-mist">
                Nothing waiting on you.
              </div>
            ) : (
              <div className="grid gap-3">
                {pending.map((event, index) => (
                  <QueueCard
                    key={event.id}
                    event={event}
                    index={index}
                    mode="pending"
                    acting={acting === event.id}
                    onDecide={decide}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Rejected column */}
          <section
            className={`${
              mobileTab === 'REJECTED' ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="mb-4 flex items-center justify-between border-b border-red-400/20 pb-3">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                Rejected
              </h2>
              <span className="rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-300">
                {rejected.length}
              </span>
            </div>
            {rejected.length === 0 ? (
              <div className="surface px-5 py-12 text-center text-sm text-mist">
                No rejected suggestions yet. They&apos;ll show up here after you
                reject from Pending.
              </div>
            ) : (
              <div className="grid gap-3">
                {rejected.map((event, index) => (
                  <QueueCard
                    key={event.id}
                    event={event}
                    index={index}
                    mode="rejected"
                    acting={false}
                    onDecide={decide}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function AddVenueForm({
  onAdded,
  onCancel,
}: {
  onAdded: (venue: Venue) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const venue = await api<Venue>('/venues', {
        method: 'POST',
        body: JSON.stringify({
          name,
          location: location || undefined,
          capacity: Number(capacity),
        }),
      });
      setName('');
      setLocation('');
      setCapacity('100');
      await onAdded(venue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add venue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="surface mt-4 grid gap-4 p-5 animate-fade-in sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <p className="label-caps">New venue</p>
        <p className="mt-1 text-sm text-mist">
          This room is assigned to you. Customers will see it when pitching
          events.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-mist">
          Name
        </label>
        <input
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Rooftop Terrace"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-mist">
          Location (optional)
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input-field"
          placeholder="Hackney"
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
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="flex items-end gap-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Adding…' : 'Save venue'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost"
          disabled={busy}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
    </form>
  );
}

function QueueCard({
  event,
  index,
  mode,
  acting,
  onDecide,
}: {
  event: EventItem;
  index: number;
  mode: 'pending' | 'rejected';
  acting: boolean;
  onDecide: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}) {
  return (
    <article
      className={`surface p-4 animate-stagger ${
        mode === 'rejected'
          ? 'border-red-400/20 bg-red-500/[0.04]'
          : 'surface-interactive'
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-mist-soft">
            <span
              className={`font-display text-base font-bold ${
                mode === 'rejected' ? 'text-red-300' : 'text-ember'
              }`}
            >
              #{index + 1}
            </span>
            <span>{event.venue?.name}</span>
            {event.venue?.capacity != null && (
              <>
                <span>·</span>
                <span>Cap. {event.venue.capacity}</span>
              </>
            )}
            <span>·</span>
            <span>{event.upvoteCount} upvotes</span>
          </div>
          <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
            {event.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mist line-clamp-3">
            {event.description}
          </p>
          <p className="mt-2 text-xs text-mist-soft">
            {formatDate(event.proposedAt)}
            {event.author ? ` · ${event.author.name}` : ''}
          </p>
        </div>

        {mode === 'pending' ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={acting}
              onClick={() => onDecide(event.id, 'REJECTED')}
              className="btn-ghost !px-3 !py-2 text-xs uppercase tracking-wider"
            >
              {acting ? '…' : 'Reject'}
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => onDecide(event.id, 'APPROVED')}
              className="btn-primary !px-3 !py-2 text-xs uppercase tracking-wider"
            >
              {acting ? '…' : 'Approve'}
            </button>
          </div>
        ) : (
          <span className="shrink-0 rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
            Rejected
          </span>
        )}
      </div>
    </article>
  );
}

export default function QueuePage() {
  return (
    <RequireRole role="VENUE_MANAGER">
      <QueueContent />
    </RequireRole>
  );
}
