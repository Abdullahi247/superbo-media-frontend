import Link from 'next/link';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span
        className="relative flex h-7 w-7 items-center justify-center rounded-md bg-ember transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-110 group-active:scale-95"
        aria-hidden
      >
        <span className="grid grid-cols-2 gap-[3px] transition-transform duration-300 group-hover:scale-90">
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink" />
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink" />
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink" />
          <i className="block h-1.5 w-1.5 rounded-[1px] bg-ink/40 transition-opacity duration-300 group-hover:opacity-100" />
        </span>
      </span>
      {!compact && (
        <span className="font-display text-xl font-bold uppercase tracking-[0.12em] text-white transition-colors duration-200 group-hover:text-ember-bright">
          Superbo Media Test
        </span>
      )}
    </Link>
  );
}
