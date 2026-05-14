export const campaignActionItemStatuses = ['todo', 'doing', 'done'] as const;

export type CampaignActionItemStatus = (typeof campaignActionItemStatuses)[number];

export const campaignActionItemStatusLabels: Record<CampaignActionItemStatus, string> = {
  todo: 'Cần làm',
  doing: 'Đang làm',
  done: 'Hoàn thành'
};

export interface CampaignActionItem {
  id: number;
  campaignId: number;
  title: string;
  memo: string | null;
  status: CampaignActionItemStatus;
  dueDate: string | null;
  createdByAdminId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignActionItemSummary {
  totalCount: number;
  todoCount: number;
  doingCount: number;
  doneCount: number;
  overdueCount: number;
}

export interface CampaignActionItemPagination {
  count: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

export interface CampaignActionItemFilters {
  q?: string;
  status?: CampaignActionItemStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  perPage?: number;
}

export interface CampaignActionItemInput {
  title: string;
  memo: string;
  status: CampaignActionItemStatus;
  dueDate: string;
}

export interface CampaignActionItemsListResult {
  actionItems: CampaignActionItem[];
  summary: CampaignActionItemSummary;
  pagination: CampaignActionItemPagination;
}

export interface CampaignActionItemsFieldErrors {
  title?: string[];
  memo?: string[];
  status?: string[];
  dueDate?: string[];
}

export interface CampaignActionItemsDomainError {
  code: string;
  message: string;
  details?: CampaignActionItemsFieldErrors;
}

export const emptyCampaignActionItemSummary: CampaignActionItemSummary = {
  totalCount: 0,
  todoCount: 0,
  doingCount: 0,
  doneCount: 0,
  overdueCount: 0
};

export const emptyCampaignActionItemPagination: CampaignActionItemPagination = {
  count: 0,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 20
};
