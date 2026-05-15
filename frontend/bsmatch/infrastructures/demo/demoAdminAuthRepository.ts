import type { AdminAuthRepository, AdminSession } from '../../repositories/adminAuthRepository';

export class DemoAdminAuthRepository implements AdminAuthRepository {
  public async authenticate(): Promise<AdminSession | null> {
    return null;
  }

  public async logout(): Promise<void> {
    return undefined;
  }
}
