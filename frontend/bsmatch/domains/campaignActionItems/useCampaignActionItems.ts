import { useCallback, useReducer } from 'react';
import type {
  CampaignActionItemFilters,
  CampaignActionItemInput,
  CampaignActionItemStatus,
  CampaignActionItemsDomainError
} from './entities';
import { campaignActionItemsReducer, initialCampaignActionItemsState } from './state';
import type { CampaignActionItemsRepository } from '../../repositories/campaignActionItemsRepository';

export interface UseCampaignActionItemsParams {
  campaignId: number;
  repository: CampaignActionItemsRepository;
}

export interface UseCampaignActionItemsResult {
  state: typeof initialCampaignActionItemsState;
  load: (filters: CampaignActionItemFilters) => Promise<void>;
  create: (input: CampaignActionItemInput) => Promise<boolean>;
  update: (actionItemId: number, input: Partial<CampaignActionItemInput>) => Promise<boolean>;
  updateStatus: (actionItemId: number, status: CampaignActionItemStatus) => Promise<boolean>;
  destroy: (actionItemId: number) => Promise<boolean>;
  clearError: () => void;
}

export const useCampaignActionItems = ({ campaignId, repository }: UseCampaignActionItemsParams): UseCampaignActionItemsResult => {
  const [state, dispatch] = useReducer(campaignActionItemsReducer, initialCampaignActionItemsState);

  const handleFailure = useCallback((error: unknown) => {
    dispatch({ kind: 'failure', error: normalizeDomainError(error) });
  }, []);

  const load = useCallback(
    async (filters: CampaignActionItemFilters) => {
      dispatch({ kind: 'loadRequest' });
      try {
        const result = await repository.list(campaignId, filters);
        dispatch({
          kind: 'loadSuccess',
          actionItems: result.actionItems,
          summary: result.summary,
          pagination: result.pagination
        });
      } catch (error) {
        handleFailure(error);
      }
    },
    [campaignId, handleFailure, repository]
  );

  const create = useCallback(
    async (input: CampaignActionItemInput) => {
      dispatch({ kind: 'saveRequest' });
      try {
        const actionItem = await repository.create(campaignId, input);
        dispatch({ kind: 'saveSuccess', actionItem });
        return true;
      } catch (error) {
        handleFailure(error);
        return false;
      }
    },
    [campaignId, handleFailure, repository]
  );

  const update = useCallback(
    async (actionItemId: number, input: Partial<CampaignActionItemInput>) => {
      dispatch({ kind: 'saveRequest' });
      try {
        const actionItem = await repository.update(campaignId, actionItemId, input);
        dispatch({ kind: 'saveSuccess', actionItem });
        return true;
      } catch (error) {
        handleFailure(error);
        return false;
      }
    },
    [campaignId, handleFailure, repository]
  );

  const updateStatus = useCallback(
    async (actionItemId: number, status: CampaignActionItemStatus) => {
      return update(actionItemId, { status });
    },
    [update]
  );

  const destroy = useCallback(
    async (actionItemId: number) => {
      dispatch({ kind: 'saveRequest' });
      try {
        await repository.destroy(campaignId, actionItemId);
        dispatch({ kind: 'saveSuccess', deletedActionItemId: actionItemId });
        return true;
      } catch (error) {
        handleFailure(error);
        return false;
      }
    },
    [campaignId, handleFailure, repository]
  );

  const clearError = useCallback(() => {
    dispatch({ kind: 'clearError' });
  }, []);

  return { state, load, create, update, updateStatus, destroy, clearError };
};

export const normalizeDomainError = (error: unknown): CampaignActionItemsDomainError => {
  if (isDomainError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return { code: 'unknown_error', message: error.message };
  }

  return { code: 'unknown_error', message: 'Unexpected UI error.' };
};

export const isDomainError = (error: unknown): error is CampaignActionItemsDomainError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};
