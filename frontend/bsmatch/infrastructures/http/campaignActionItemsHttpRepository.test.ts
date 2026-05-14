import {
  mapActionItemFromApi,
  mapErrorResponse,
  mapPaginationFromApi,
  mapSummaryFromApi,
  toPayload,
  toQueryString
} from './campaignActionItemsHttpRepository';

describe('CampaignActionItemsHttpRepository mappers', () => {
  it('maps API action item fields to frontend entity fields', () => {
    const actionItem = mapActionItemFromApi({
      id: 1,
      campaign_id: 10,
      title: 'Confirm creator shortlist',
      memo: 'Review candidate list before client meeting.',
      status: 'todo',
      due_date: '2026-05-15',
      created_by_admin_id: 3,
      created_at: '2026-05-12T10:00:00.000Z',
      updated_at: '2026-05-12T11:30:00.000Z'
    });

    expect(actionItem).toEqual({
      id: 1,
      campaignId: 10,
      title: 'Confirm creator shortlist',
      memo: 'Review candidate list before client meeting.',
      status: 'todo',
      dueDate: '2026-05-15',
      createdByAdminId: 3,
      createdAt: '2026-05-12T10:00:00.000Z',
      updatedAt: '2026-05-12T11:30:00.000Z'
    });
  });

  it('maps summary and pagination fields from API contract', () => {
    expect(
      mapSummaryFromApi({
        total_count: 12,
        todo_count: 5,
        doing_count: 4,
        done_count: 3,
        overdue_count: 2
      })
    ).toEqual({ totalCount: 12, todoCount: 5, doingCount: 4, doneCount: 3, overdueCount: 2 });

    expect(
      mapPaginationFromApi({
        count: 1,
        current_page: 1,
        total_pages: 2,
        total_count: 21,
        per_page: 20
      })
    ).toEqual({ count: 1, currentPage: 1, totalPages: 2, totalCount: 21, perPage: 20 });
  });

  it('maps request payload and query params to API contract names', () => {
    expect(toPayload({ title: 'Review brief', memo: '', status: 'doing', dueDate: '2026-05-20' })).toEqual({
      campaign_action_item: {
        title: 'Review brief',
        memo: '',
        status: 'doing',
        due_date: '2026-05-20'
      }
    });

    expect(
      toQueryString({
        q: 'shortlist',
        status: 'todo',
        dueDateFrom: '2026-05-12',
        dueDateTo: '2026-05-20',
        page: 1,
        perPage: 20
      })
    ).toBe('q=shortlist&status=todo&due_date_from=2026-05-12&due_date_to=2026-05-20&page=1&per_page=20');
  });

  it('maps API error details to domain error shape', async () => {
    const response = {
      status: 422,
      json: async () => ({
        error: {
          code: 'validation_error',
          message: 'Validation failed.',
          details: { title: ["can't be blank"], due_date: ['is invalid'] }
        }
      })
    } as Response;

    await expect(mapErrorResponse(response)).resolves.toEqual({
      code: 'validation_error',
      message: 'Validation failed.',
      details: { title: ["can't be blank"], memo: undefined, status: undefined, dueDate: ['is invalid'] }
    });
  });
});
