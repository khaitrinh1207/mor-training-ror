import type { CampaignActionItem } from './entities';
import { campaignActionItemsReducer, initialCampaignActionItemsState, mergeSavedActionItem } from './state';

const baseActionItem: CampaignActionItem = {
  id: 1,
  campaignId: 10,
  title: 'Confirm creator shortlist',
  memo: 'Review candidate list before client meeting.',
  status: 'todo',
  dueDate: '2026-05-15',
  createdByAdminId: 3,
  createdAt: '2026-05-12T10:00:00.000Z',
  updatedAt: '2026-05-12T10:00:00.000Z'
};

describe('campaignActionItemsReducer', () => {
  it('stores list response metadata from API contract', () => {
    const state = campaignActionItemsReducer(initialCampaignActionItemsState, {
      kind: 'loadSuccess',
      actionItems: [baseActionItem],
      summary: { totalCount: 1, todoCount: 1, doingCount: 0, doneCount: 0, overdueCount: 0 },
      pagination: { count: 1, currentPage: 1, totalPages: 1, totalCount: 1, perPage: 20 }
    });

    expect(state.actionItems).toEqual([baseActionItem]);
    expect(state.summary.todoCount).toBe(1);
    expect(state.pagination.perPage).toBe(20);
    expect(state.isLoading).toBe(false);
  });

  it('tracks failures without losing current list data', () => {
    const loadedState = { ...initialCampaignActionItemsState, actionItems: [baseActionItem], isLoading: true };
    const state = campaignActionItemsReducer(loadedState, {
      kind: 'failure',
      error: { code: 'invalid_parameter', message: 'Invalid request parameter.' }
    });

    expect(state.actionItems).toEqual([baseActionItem]);
    expect(state.isLoading).toBe(false);
    expect(state.error?.code).toBe('invalid_parameter');
  });
});

describe('mergeSavedActionItem', () => {
  it('prepends new items, replaces existing items, and removes deleted items', () => {
    const savedActionItem = { ...baseActionItem, id: 2, title: 'New action item' };
    const updatedActionItem = { ...baseActionItem, status: 'doing' as const };

    expect(mergeSavedActionItem([baseActionItem], savedActionItem)).toEqual([savedActionItem, baseActionItem]);
    expect(mergeSavedActionItem([baseActionItem], updatedActionItem)).toEqual([updatedActionItem]);
    expect(mergeSavedActionItem([baseActionItem], undefined, 1)).toEqual([]);
  });
});
