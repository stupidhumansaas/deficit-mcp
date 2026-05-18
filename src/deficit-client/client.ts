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

async function apiFetch<T>(path: string, token?: string): Promise<T> {
  const bearer = token ?? config.deficitBearerToken;
  const res = await fetch(`${config.deficitApiBase}${path}`, {
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      'X-Client-Type': 'deficit-mcp',
    },
  });
  if (!res.ok) throw new Error(`DEFICIT API error ${res.status}: ${path}`);
  const body = (await res.json()) as { success: boolean; data?: T };
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

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
