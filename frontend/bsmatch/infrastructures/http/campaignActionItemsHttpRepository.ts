import { campaignActionItemPath, campaignActionItemsPath, readCsrfToken } from '../../configs/api';
import type {
  CampaignActionItem,
  CampaignActionItemFilters,
  CampaignActionItemInput,
  CampaignActionItemPagination,
  CampaignActionItemSummary,
  CampaignActionItemStatus,
  CampaignActionItemsDomainError,
  CampaignActionItemsFieldErrors,
  CampaignActionItemsListResult
} from '../../domains/campaignActionItems/entities';
import type { CampaignActionItemsRepository } from '../../repositories/campaignActionItemsRepository';

export interface CampaignActionItemApiResource {
  id: number;
  campaign_id: number;
  title: string;
  memo: string | null;
  status: CampaignActionItemStatus;
  due_date: string | null;
  created_by_admin_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignActionItemSummaryApiResource {
  total_count: number;
  todo_count: number;
  doing_count: number;
  done_count: number;
  overdue_count: number;
}

export interface CampaignActionItemPaginationApiResource {
  count: number;
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface CampaignActionItemsIndexApiResponse {
  campaign_action_items: CampaignActionItemApiResource[];
  summary: CampaignActionItemSummaryApiResource;
  pagination: CampaignActionItemPaginationApiResource;
}

export interface CampaignActionItemApiResponse {
  campaign_action_item: CampaignActionItemApiResource;
}

export interface CampaignActionItemApiInput {
  title?: string;
  memo?: string;
  status?: CampaignActionItemStatus;
  due_date?: string;
}

export interface CampaignActionItemApiPayload {
  campaign_action_item: CampaignActionItemApiInput;
}

export interface CampaignActionItemApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, string[]>;
  };
}

export interface HttpClient {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface CampaignActionItemsHttpRepositoryParams {
  client?: HttpClient;
  csrfToken?: string;
}

export class CampaignActionItemsHttpRepository implements CampaignActionItemsRepository {
  private readonly client: HttpClient;
  private readonly csrfToken?: string;

  public constructor(params: CampaignActionItemsHttpRepositoryParams = {}) {
    this.client = params.client ?? { fetch: window.fetch.bind(window) };
    this.csrfToken = params.csrfToken ?? readCsrfToken();
  }

  public async list(campaignId: number, filters: CampaignActionItemFilters = {}): Promise<CampaignActionItemsListResult> {
    const response = await this.client.fetch(`${campaignActionItemsPath(campaignId)}?${toQueryString(filters)}`, {
      headers: jsonHeaders(this.csrfToken)
    });
    const body = await parseJsonResponse<CampaignActionItemsIndexApiResponse>(response);

    return {
      actionItems: body.campaign_action_items.map(mapActionItemFromApi),
      summary: mapSummaryFromApi(body.summary),
      pagination: mapPaginationFromApi(body.pagination)
    };
  }

  public async create(campaignId: number, input: CampaignActionItemInput): Promise<CampaignActionItem> {
    const response = await this.client.fetch(campaignActionItemsPath(campaignId), {
      method: 'POST',
      headers: jsonHeaders(this.csrfToken),
      body: JSON.stringify(toPayload(input))
    });
    const body = await parseJsonResponse<CampaignActionItemApiResponse>(response);

    return mapActionItemFromApi(body.campaign_action_item);
  }

  public async update(
    campaignId: number,
    actionItemId: number,
    input: Partial<CampaignActionItemInput>
  ): Promise<CampaignActionItem> {
    const response = await this.client.fetch(campaignActionItemPath(campaignId, actionItemId), {
      method: 'PATCH',
      headers: jsonHeaders(this.csrfToken),
      body: JSON.stringify(toPayload(input))
    });
    const body = await parseJsonResponse<CampaignActionItemApiResponse>(response);

    return mapActionItemFromApi(body.campaign_action_item);
  }

  public async destroy(campaignId: number, actionItemId: number): Promise<void> {
    const response = await this.client.fetch(campaignActionItemPath(campaignId, actionItemId), {
      method: 'DELETE',
      headers: jsonHeaders(this.csrfToken)
    });

    await parseEmptyResponse(response);
  }
}

export const mapActionItemFromApi = (resource: CampaignActionItemApiResource): CampaignActionItem => {
  return {
    id: resource.id,
    campaignId: resource.campaign_id,
    title: resource.title,
    memo: resource.memo,
    status: resource.status,
    dueDate: resource.due_date,
    createdByAdminId: resource.created_by_admin_id,
    createdAt: resource.created_at,
    updatedAt: resource.updated_at
  };
};

export const mapSummaryFromApi = (resource: CampaignActionItemSummaryApiResource): CampaignActionItemSummary => {
  return {
    totalCount: resource.total_count,
    todoCount: resource.todo_count,
    doingCount: resource.doing_count,
    doneCount: resource.done_count,
    overdueCount: resource.overdue_count
  };
};

export const mapPaginationFromApi = (resource: CampaignActionItemPaginationApiResource): CampaignActionItemPagination => {
  return {
    count: resource.count,
    currentPage: resource.current_page,
    totalPages: resource.total_pages,
    totalCount: resource.total_count,
    perPage: resource.per_page
  };
};

export const toPayload = (input: Partial<CampaignActionItemInput>): CampaignActionItemApiPayload => {
  return {
    campaign_action_item: {
      title: input.title,
      memo: input.memo,
      status: input.status,
      due_date: input.dueDate
    }
  };
};

export const toQueryString = (filters: CampaignActionItemFilters): string => {
  const params = new URLSearchParams();

  appendParam(params, 'q', filters.q);
  appendParam(params, 'status', filters.status);
  appendParam(params, 'due_date_from', filters.dueDateFrom);
  appendParam(params, 'due_date_to', filters.dueDateTo);
  appendParam(params, 'page', filters.page);
  appendParam(params, 'per_page', filters.perPage);

  return params.toString();
};

export const appendParam = (params: URLSearchParams, key: string, value?: string | number): void => {
  if (value === undefined || value === '') {
    return;
  }

  params.append(key, String(value));
};

export const jsonHeaders = (csrfToken?: string): HeadersInit => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
  };
};

export const parseJsonResponse = async <TResponse>(response: Response): Promise<TResponse> => {
  if (!response.ok) {
    throw await mapErrorResponse(response);
  }

  return (await response.json()) as TResponse;
};

export const parseEmptyResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    throw await mapErrorResponse(response);
  }
};

export const mapErrorResponse = async (response: Response): Promise<CampaignActionItemsDomainError> => {
  const body = await safeReadErrorBody(response);
  const apiError = body.error;

  return {
    code: apiError?.code ?? `http_${response.status}`,
    message: apiError?.message ?? 'Request failed.',
    details: mapFieldErrors(apiError?.details)
  };
};

export const safeReadErrorBody = async (response: Response): Promise<CampaignActionItemApiErrorBody> => {
  try {
    return (await response.json()) as CampaignActionItemApiErrorBody;
  } catch (_error) {
    return {};
  }
};

export const mapFieldErrors = (details?: Record<string, string[]>): CampaignActionItemsFieldErrors | undefined => {
  if (!details) {
    return undefined;
  }

  return {
    title: details.title,
    memo: details.memo,
    status: details.status,
    dueDate: details.due_date
  };
};
