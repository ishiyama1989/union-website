import { cookies } from 'next/headers';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyAdmin(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_authenticated');
  return authCookie?.value === 'true';
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_authenticated', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_authenticated');
}