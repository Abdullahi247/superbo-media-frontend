'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../lib/types';

interface Props {
  role: UserRole;
  children: ReactNode;
  /** Where guests are sent (default /login) */
  loginHref?: string;
  /** Where the wrong role is sent */
  fallbackHref?: string;
}

/**
 * UI gate only — real enforcement is on the NestJS API (JWT + RolesGuard + service checks).
 * Wrong-role users are redirected; they still cannot call protected endpoints successfully.
 */
export function RequireRole({
  role,
  children,
  loginHref = '/login',
  fallbackHref = '/',
}: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(loginHref);
      return;
    }
    if (user.role !== role) {
      router.replace(
        user.role === 'VENUE_MANAGER' ? '/queue' : fallbackHref,
      );
    }
  }, [user, loading, role, router, loginHref, fallbackHref]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-mist loading-pulse">
        Checking access…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="label-caps">Sign in required</p>
        <h1 className="mt-2 heading-display text-3xl">Access locked</h1>
        <p className="mt-3 text-sm text-mist">
          You need an account to continue.
        </p>
        <Link href={loginHref} className="btn-primary mt-6">
          Sign in
        </Link>
      </div>
    );
  }

  if (user.role !== role) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center animate-fade-in">
        <p className="label-caps">Wrong role</p>
        <h1 className="mt-2 heading-display text-3xl">Not available</h1>
        <p className="mt-3 text-sm text-mist">
          This area is for{' '}
          {role === 'CUSTOMER' ? 'customers' : 'venue managers'} only. Signed in
          as {user.role === 'CUSTOMER' ? 'Customer' : 'Venue manager'}.
        </p>
        <Link
          href={user.role === 'VENUE_MANAGER' ? '/queue' : '/'}
          className="btn-primary mt-6"
        >
          Go to your home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
