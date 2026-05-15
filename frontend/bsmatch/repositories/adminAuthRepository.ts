export interface AdminSession {
  id: number;
  email: string;
  csrfToken?: string;
}

export interface AdminAuthRepository {
  authenticate(): Promise<AdminSession | null>;
  logout(): Promise<void>;
}
