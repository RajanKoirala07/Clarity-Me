import { api } from './api';
import { setItem, getItem, removeItem } from './storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  hasLoggedInOnce: boolean;
  profileImage: string;
  roleId: string;
  roleTitle: string;
  branchId: string;
  branchTitle: string;
  permission: Record<string, unknown>;
  isPrintEnabled: boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  apiKeys: { accessKey: string; secretKey: string };
}

export async function login(username: string, password: string): Promise<User> {
  const data = await api.post<LoginResponse>('/auth/login', { username, password });
  await setItem('accessToken', data.accessToken);
  await setItem('refreshToken', data.refreshToken);
  return data.user;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
}): Promise<void> {
  await api.post('/auth/register', payload);
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/reset-password', { email });
}

export async function resetPassword(
  verificationCode: string,
  password: string,
): Promise<void> {
  await api.post(`/reset-password/${verificationCode}`, { password });
}

export async function logout(): Promise<void> {
  await removeItem('accessToken');
  await removeItem('refreshToken');
}

export async function getStoredToken(): Promise<string | null> {
  return getItem('accessToken');
}
