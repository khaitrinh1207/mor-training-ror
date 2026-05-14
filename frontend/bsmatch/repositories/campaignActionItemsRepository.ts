import type {
  CampaignActionItem,
  CampaignActionItemFilters,
  CampaignActionItemInput,
  CampaignActionItemsListResult
} from '../domains/campaignActionItems/entities';

export interface CampaignActionItemsRepository {
  list(campaignId: number, filters: CampaignActionItemFilters): Promise<CampaignActionItemsListResult>;
  create(campaignId: number, input: CampaignActionItemInput): Promise<CampaignActionItem>;
  update(campaignId: number, actionItemId: number, input: Partial<CampaignActionItemInput>): Promise<CampaignActionItem>;
  destroy(campaignId: number, actionItemId: number): Promise<void>;
}
