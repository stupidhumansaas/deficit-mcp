import { config } from '../config.js';

interface FoodLog {
  id: string;
  date: string;
  calories: number;
  description: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  source: string;
}

interface UserProfile {
  weightKg?: number;
  heightCm?: number;
  baseLimit?: number;
  weeklyGoal?: string;
  subscriptionTier?: string;
}

interface HealthSnapshot {
  date: string;
  stepsToday?: number;
  activeKcalToday?: number;
  sleepHours?: number;
  hrvMs?: number;
  rhrBpm?: number;
  weightKg?: number;
}

export async function apiFetch<T>(path: string, token?: string): Promise<T> {
  if (!token) throw new Error('Authentication required');
  const bearer = token;
  const res = await fetch(`${config.deficitApiBase}${path}`, {
    signal: AbortSignal.timeout(15000),
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      'X-Client-Type': 'deficit-mcp',
    },
  });
  if (!res.ok) throw new Error(`DEFICIT API error ${res.status}: ${path}`);
  const body = (await res.json()) as { success: boolean; data?: T };
  if (!body.success || body.data === undefined) throw new Error('Invalid API response');
  return body.data as T;
}

export async function getTodayFoodLogs(date: string, token?: string): Promise<FoodLog[]> {
  return apiFetch<FoodLog[]>(`/api/foodlogs?date=${date}`, token);
}

export async function getUserProfile(token?: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/users/me', token);
}

export async function getHealthSnapshot(date: string, token?: string): Promise<HealthSnapshot | null> {
  try {
    return await apiFetch<HealthSnapshot>(`/api/users/me/health/snapshot?date=${date}`, token);
  } catch {
    return null;
  }
}

export function todayDate(timezone = 'UTC'): string {
  return new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
}
