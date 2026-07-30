'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from '../lib/auth';

const linkBase =
  'text-xs font-semibold uppercase tracking-[0.16em] transition';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="relative z-20 border-b border-ink-line/50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className={`${linkBase} ${
                isActive('/') && pathname === '/'
                  ? 'text-white'
                  : 'text-mist hover:text-white'
              }`}
            >
              Board
            </Link>
            {(!user || user.role === 'CUSTOMER') && (
              <Link
                href="/suggest"
                className={`${linkBase} ${
                  isActive('/suggest')
                    ? 'text-white'
                    : 'text-mist hover:text-white'
                }`}
              >
                Suggest
              </Link>
            )}
            {user?.role === 'VENUE_MANAGER' && (
              <Link
                href="/queue"
                className={`${linkBase} ${
                  isActive('/queue')
                    ? 'text-white'
                    : 'text-mist hover:text-white'
                }`}
              >
                Queue
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-mist-soft">
                  {user.role === 'VENUE_MANAGER' ? 'Venue manager' : 'Customer'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="btn-ghost !px-3.5 !py-2 text-xs uppercase tracking-wider"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary !px-4 !py-2 text-xs uppercase tracking-wider">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
