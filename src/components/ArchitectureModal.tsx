'use client';

import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="architecture-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm animate-fade-in"
        aria-label="Close architecture view"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-ink-line bg-ink-soft shadow-[0_24px_80px_rgba(0,0,0,0.55)] animate-fade-in-delay">
        <div className="flex items-center justify-between gap-4 border-b border-ink-line px-5 py-3.5">
          <div>
            <p className="label-caps">System overview</p>
            <h2
              id="architecture-title"
              className="font-display text-2xl font-bold uppercase tracking-wide text-white"
            >
              Architecture
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !px-3.5 !py-2 text-xs uppercase tracking-wider"
          >
            Close
          </button>
        </div>

        <div className="overflow-auto bg-ink/40 p-3 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/superbo-media-architecture.png"
            alt="Superbo Media frontend and backend architecture diagram"
            className="mx-auto h-auto w-full rounded-lg border border-ink-line/60"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-line px-5 py-3 text-xs text-mist-soft">
          <span>Frontend · Backend · API · SQLite</span>
          <a
            href="/superbo-media-architecture.png"
            target="_blank"
            rel="noreferrer"
            className="link-ember text-xs"
          >
            Open full size →
          </a>
        </div>
      </div>
    </div>
  );
}
