'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import type { EventItem, EventStatus, Stats, Venue } from '../lib/types';
import { EventCard } from './EventCard';

const FILTERS: Array<{ key: EventStatus | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function Board() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [venueId, setVenueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Venue[]>('/venues').then(setVenues).catch(() => undefined);
    api<Stats>('/events/stats').then(setStats).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (filter !== 'ALL') params.set('status', filter);
        if (venueId) params.set('venueId', venueId);
        const qs = params.toString();
        const data = await api<EventItem[]>(`/events${qs ? `?${qs}` : ''}`);
        if (!cancelled) setEvents(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load board');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, venueId]);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:pt-20">
        <p className="label-caps animate-fade-in">Crowd-programmed nights</p>
        <h1 className="mt-3 max-w-3xl animate-fade-in-delay font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide text-white sm:text-6xl lg:text-7xl">
          The lineup is decided by{' '}
          <span className="text-ember">the room</span>, not the office.
        </h1>
        <p className="mt-5 max-w-xl animate-fade-in-late text-base leading-relaxed text-mist sm:text-lg">
          Pitch the night you want at your favourite venue. Everyone upvotes.
          The venue manager works the queue from the top down and approves what
          the crowd actually asked for.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4 animate-fade-in-late">
          <Link href="/suggest" className="btn-primary">
            Suggest an event
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-ember transition hover:text-ember-bright"
          >
            Sign in to vote
          </Link>
        </div>

        {stats && (
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line sm:grid-cols-4">
            {[
              ['Suggestions', stats.suggestions],
              ['In queue', stats.inQueue],
              ['Approved', stats.approved],
              ['Upvotes', stats.upvotes],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="bg-ink-soft/90 px-5 py-4 text-center sm:text-left"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-soft">
                  {label}
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
            The Board
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-ink-line bg-ink-soft/60 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                    filter === f.key
                      ? 'bg-ember text-ink'
                      : 'text-mist hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="input-field !w-auto !py-2 text-xs"
            >
              <option value="">All venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="surface px-6 py-16 text-center text-mist">
            Loading the board…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200">
            {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="surface px-6 py-16 text-center">
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              Nothing here yet
            </h3>
            <p className="mt-2 text-sm text-mist">
              Be the first to pitch a night at one of our venues.
            </p>
            <Link href="/suggest" className="btn-primary mt-6">
              Suggest an event
            </Link>
          </div>
        )}
        <div className="grid gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onChange={(updated) =>
                setEvents((prev) =>
                  prev.map((e) => (e.id === updated.id ? updated : e)),
                )
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
