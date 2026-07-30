export type UserRole = 'CUSTOMER' | 'VENUE_MANAGER';
export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  venues?: Venue[];
}

export interface Venue {
  id: string;
  name: string;
  location: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  proposedAt: string;
  status: EventStatus;
  upvoteCount: number;
  hasVoted: boolean;
  createdAt: string;
  author?: { id: string; name: string };
  venue?: Venue;
}

export interface Stats {
  suggestions: number;
  inQueue: number;
  approved: number;
  upvotes: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
