import { AdminAuthHttpRepository } from './adminAuthHttpRepository';

const buildResponse = (body: unknown, status = 200): Response => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body)
  } as unknown as Response;
};

describe('AdminAuthHttpRepository', () => {
  it('maps the current admin session from the auth API', async () => {
    const fetch = jest.fn().mockResolvedValue(
      buildResponse({
        admin: {
          id: 1,
          email: 'admin@example.com',
          csrf_token: 'csrf-token-value'
        },
        is_logged_in: true
      })
    );
    const repository = new AdminAuthHttpRepository({ client: { fetch } });

    await expect(repository.authenticate()).resolves.toEqual({
      id: 1,
      email: 'admin@example.com',
      csrfToken: 'csrf-token-value'
    });
    expect(fetch).toHaveBeenCalledWith('/match/api/v2/auth/admins/authenticate', {
      headers: { Accept: 'application/json' }
    });
  });

  it('maps unauthenticated responses to a guest admin state', async () => {
    const fetch = jest.fn().mockResolvedValue(buildResponse({ error: { code: 'admin_authorization_error' } }, 401));
    const repository = new AdminAuthHttpRepository({ client: { fetch } });

    await expect(repository.authenticate()).resolves.toBeNull();
  });

  it('calls the auth API logout endpoint', async () => {
    const fetch = jest.fn().mockResolvedValue(buildResponse(undefined, 204));
    const repository = new AdminAuthHttpRepository({ client: { fetch } });

    await repository.logout();

    expect(fetch).toHaveBeenCalledWith('/match/api/v2/auth/admins/sign_out', {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
  });
});
