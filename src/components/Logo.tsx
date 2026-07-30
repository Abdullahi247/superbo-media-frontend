import Link from 'next/link';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span
        className="relative flex h-7 w-7 items-center justify-center rounded-md bg-ember"
        aria-hidden
      >
        <span className="grid grid-cols-2 gap-[3px]">
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink" />
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink" />
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink" />
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink/40" />
        </span>
      </span>
      {!compact && (
        <span className="font-display text-xl font-bold uppercase tracking-[0.12em] text-white transition group-hover:text-ember-bright">
          Marquee
        </span>
      )}
    </Link>
  );
}
