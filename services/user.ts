import { api } from './api';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role_id?: string;
  phone_number?: string;
  branch_id?: string;
}

export async function addUser(payload: CreateUserPayload): Promise<void> {
  await api.post('/user/add-user', payload, true); // true = requiresAuth
}
