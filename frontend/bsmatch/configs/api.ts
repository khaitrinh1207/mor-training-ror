export const matchAdminApiBasePath = '/match/api/v2/admin';
export const matchAuthApiBasePath = '/match/api/v2/auth';

export const adminSignInPath = '/admins/sign_in';
export const adminSignUpPath = '/admins/sign_up';
export const adminAuthenticatePath = `${matchAuthApiBasePath}/admins/authenticate`;
export const adminSignOutPath = `${matchAuthApiBasePath}/admins/sign_out`;

export const campaignActionItemsPath = (campaignId: number): string => {
  return `${matchAdminApiBasePath}/campaigns/${campaignId}/action_items`;
};

export const campaignActionItemPath = (campaignId: number, actionItemId: number): string => {
  return `${campaignActionItemsPath(campaignId)}/${actionItemId}`;
};

export const readCsrfToken = (): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
};

export const writeCsrfToken = (csrfToken?: string): void => {
  if (typeof document === 'undefined' || !csrfToken) {
    return;
  }

  let metaElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');

  if (!metaElement) {
    metaElement = document.createElement('meta');
    metaElement.name = 'csrf-token';
    document.head.appendChild(metaElement);
  }

  metaElement.content = csrfToken;
};
