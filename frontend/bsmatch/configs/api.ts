export const matchAdminApiBasePath = '/match/api/v2/admin';

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
