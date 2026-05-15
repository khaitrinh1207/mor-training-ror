import { adminAuthenticatePath, adminSignOutPath } from '../../configs/api';
import type { AdminAuthRepository, AdminSession } from '../../repositories/adminAuthRepository';

export interface AdminAuthApiResource {
  id: number;
  email: string;
  csrf_token?: string;
}

export interface AdminAuthenticateApiResponse {
  admin: AdminAuthApiResource;
  is_logged_in: boolean;
}

export interface AdminAuthHttpClient {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface AdminAuthHttpRepositoryParams {
  client?: AdminAuthHttpClient;
}

export class AdminAuthHttpRepository implements AdminAuthRepository {
  private readonly client: AdminAuthHttpClient;

  public constructor(params: AdminAuthHttpRepositoryParams = {}) {
    this.client = params.client ?? { fetch: window.fetch.bind(window) };
  }

  public async authenticate(): Promise<AdminSession | null> {
    const response = await this.client.fetch(adminAuthenticatePath, {
      headers: jsonHeaders()
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Admin authentication check failed with ${response.status}.`);
    }

    const body = (await response.json()) as AdminAuthenticateApiResponse;

    if (!body.is_logged_in) {
      return null;
    }

    return {
      id: body.admin.id,
      email: body.admin.email,
      csrfToken: body.admin.csrf_token
    };
  }

  public async logout(): Promise<void> {
    const response = await this.client.fetch(adminSignOutPath, {
      method: 'DELETE',
      headers: jsonHeaders()
    });

    if (!response.ok) {
      throw new Error(`Admin logout failed with ${response.status}.`);
    }
  }
}

const jsonHeaders = (): HeadersInit => {
  return {
    Accept: 'application/json'
  };
};
