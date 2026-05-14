import type {
  CampaignActionItem,
  CampaignActionItemFilters,
  CampaignActionItemInput,
  CampaignActionItemsListResult
} from '../../domains/campaignActionItems/entities';
import type { CampaignActionItemsRepository } from '../../repositories/campaignActionItemsRepository';

export class DemoCampaignActionItemsRepository implements CampaignActionItemsRepository {
  private actionItems: CampaignActionItem[];
  private nextId = 4;

  public constructor(campaignId: number) {
    this.actionItems = [
      buildActionItem(campaignId, 1, 'Xác nhận danh sách creator', 'Xem lại danh sách ứng viên trước buổi họp với khách hàng.', 'todo', '2026-05-15'),
      buildActionItem(campaignId, 2, 'Chuẩn bị ghi chú chiến dịch', 'Tổng hợp rủi ro còn mở cho buổi review nội bộ.', 'doing', '2026-05-18'),
      buildActionItem(campaignId, 3, 'Gửi báo cáo hoàn tất', 'Chia sẻ báo cáo cuối sau khi khách hàng duyệt.', 'done', null)
    ];
  }

  public async list(campaignId: number, filters: CampaignActionItemFilters): Promise<CampaignActionItemsListResult> {
    const filteredItems = this.applyFilters(campaignId, filters);
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 20;
    const start = (page - 1) * perPage;
    const actionItems = filteredItems.slice(start, start + perPage);

    return {
      actionItems,
      summary: buildSummary(this.actionItems.filter((actionItem) => actionItem.campaignId === campaignId)),
      pagination: {
        count: actionItems.length,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(filteredItems.length / perPage)),
        totalCount: filteredItems.length,
        perPage
      }
    };
  }

  public async create(campaignId: number, input: CampaignActionItemInput): Promise<CampaignActionItem> {
    const actionItem = buildActionItem(campaignId, this.nextId, input.title, input.memo, input.status, input.dueDate || null);
    this.nextId += 1;
    this.actionItems = [actionItem, ...this.actionItems];

    return actionItem;
  }

  public async update(campaignId: number, actionItemId: number, input: Partial<CampaignActionItemInput>): Promise<CampaignActionItem> {
    const actionItem = this.actionItems.find((item) => item.campaignId === campaignId && item.id === actionItemId);
    if (!actionItem) {
      throw new Error('Không tìm thấy đầu việc demo.');
    }

    const updatedActionItem: CampaignActionItem = {
      ...actionItem,
      title: input.title ?? actionItem.title,
      memo: input.memo ?? actionItem.memo,
      status: input.status ?? actionItem.status,
      dueDate: input.dueDate ?? actionItem.dueDate,
      updatedAt: new Date().toISOString()
    };
    this.actionItems = this.actionItems.map((item) => (item.id === actionItemId ? updatedActionItem : item));

    return updatedActionItem;
  }

  public async destroy(campaignId: number, actionItemId: number): Promise<void> {
    this.actionItems = this.actionItems.filter((actionItem) => actionItem.campaignId !== campaignId || actionItem.id !== actionItemId);
  }

  private applyFilters(campaignId: number, filters: CampaignActionItemFilters): CampaignActionItem[] {
    return this.actionItems.filter((actionItem) => {
      const keyword = filters.q?.toLowerCase();
      const matchesKeyword = keyword
        ? actionItem.title.toLowerCase().includes(keyword) || (actionItem.memo ?? '').toLowerCase().includes(keyword)
        : true;
      const matchesStatus = filters.status ? actionItem.status === filters.status : true;
      const matchesDueDateFrom = filters.dueDateFrom ? Boolean(actionItem.dueDate && actionItem.dueDate >= filters.dueDateFrom) : true;
      const matchesDueDateTo = filters.dueDateTo ? Boolean(actionItem.dueDate && actionItem.dueDate <= filters.dueDateTo) : true;

      return actionItem.campaignId === campaignId && matchesKeyword && matchesStatus && matchesDueDateFrom && matchesDueDateTo;
    });
  }
}

const buildActionItem = (
  campaignId: number,
  id: number,
  title: string,
  memo: string,
  status: CampaignActionItem['status'],
  dueDate: string | null
): CampaignActionItem => {
  const timestamp = new Date('2026-05-14T10:00:00.000Z').toISOString();

  return {
    id,
    campaignId,
    title,
    memo,
    status,
    dueDate,
    createdByAdminId: 1,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

const buildSummary = (actionItems: CampaignActionItem[]) => {
  const today = '2026-05-14';

  return {
    totalCount: actionItems.length,
    todoCount: actionItems.filter((actionItem) => actionItem.status === 'todo').length,
    doingCount: actionItems.filter((actionItem) => actionItem.status === 'doing').length,
    doneCount: actionItems.filter((actionItem) => actionItem.status === 'done').length,
    overdueCount: actionItems.filter((actionItem) => actionItem.dueDate && actionItem.dueDate < today && actionItem.status !== 'done').length
  };
};
