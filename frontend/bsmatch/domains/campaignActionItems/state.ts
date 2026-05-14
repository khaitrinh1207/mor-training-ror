import type {
  CampaignActionItem,
  CampaignActionItemPagination,
  CampaignActionItemSummary,
  CampaignActionItemsDomainError
} from './entities';
import { emptyCampaignActionItemPagination, emptyCampaignActionItemSummary } from './entities';

export interface CampaignActionItemsState {
  actionItems: CampaignActionItem[];
  summary: CampaignActionItemSummary;
  pagination: CampaignActionItemPagination;
  isLoading: boolean;
  isSaving: boolean;
  error: CampaignActionItemsDomainError | null;
}

export interface LoadRequestAction {
  kind: 'loadRequest';
}

export interface LoadSuccessAction {
  kind: 'loadSuccess';
  actionItems: CampaignActionItem[];
  summary: CampaignActionItemSummary;
  pagination: CampaignActionItemPagination;
}

export interface SaveRequestAction {
  kind: 'saveRequest';
}

export interface SaveSuccessAction {
  kind: 'saveSuccess';
  actionItem?: CampaignActionItem;
  deletedActionItemId?: number;
}

export interface FailureAction {
  kind: 'failure';
  error: CampaignActionItemsDomainError;
}

export interface ClearErrorAction {
  kind: 'clearError';
}

export type CampaignActionItemsAction =
  | LoadRequestAction
  | LoadSuccessAction
  | SaveRequestAction
  | SaveSuccessAction
  | FailureAction
  | ClearErrorAction;

export const initialCampaignActionItemsState: CampaignActionItemsState = {
  actionItems: [],
  summary: emptyCampaignActionItemSummary,
  pagination: emptyCampaignActionItemPagination,
  isLoading: false,
  isSaving: false,
  error: null
};

export const campaignActionItemsReducer = (
  state: CampaignActionItemsState,
  action: CampaignActionItemsAction
): CampaignActionItemsState => {
  switch (action.kind) {
    case 'loadRequest':
      return { ...state, isLoading: true, error: null };
    case 'loadSuccess':
      return {
        ...state,
        actionItems: action.actionItems,
        summary: action.summary,
        pagination: action.pagination,
        isLoading: false,
        error: null
      };
    case 'saveRequest':
      return { ...state, isSaving: true, error: null };
    case 'saveSuccess': {
      const actionItems = mergeSavedActionItem(state.actionItems, action.actionItem, action.deletedActionItemId);
      return { ...state, actionItems, isSaving: false, error: null };
    }
    case 'failure':
      return { ...state, isLoading: false, isSaving: false, error: action.error };
    case 'clearError':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const mergeSavedActionItem = (
  actionItems: CampaignActionItem[],
  savedActionItem?: CampaignActionItem,
  deletedActionItemId?: number
): CampaignActionItem[] => {
  if (typeof deletedActionItemId === 'number') {
    return actionItems.filter((actionItem) => actionItem.id !== deletedActionItemId);
  }

  if (!savedActionItem) {
    return actionItems;
  }

  const existingIndex = actionItems.findIndex((actionItem) => actionItem.id === savedActionItem.id);
  if (existingIndex === -1) {
    return [savedActionItem, ...actionItems];
  }

  return actionItems.map((actionItem) => (actionItem.id === savedActionItem.id ? savedActionItem : actionItem));
};
