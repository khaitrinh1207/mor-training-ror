import { useEffect, useMemo, useState } from 'react';
import {
  ActionItemFilters,
  ActionItemForm,
  ActionItemList,
  DeleteConfirmation,
  PaginationControls,
  SummaryChips
} from '../components/campaignActionItems';
import type {
  CampaignActionItem,
  CampaignActionItemFilters,
  CampaignActionItemInput,
  CampaignActionItemStatus
} from '../domains/campaignActionItems/entities';
import { useCampaignActionItems } from '../domains/campaignActionItems/useCampaignActionItems';
import { CampaignActionItemsHttpRepository } from '../infrastructures/http/campaignActionItemsHttpRepository';
import type { CampaignActionItemsRepository } from '../repositories/campaignActionItemsRepository';

export interface CampaignActionItemsPageProps {
  campaignId: number;
  repository?: CampaignActionItemsRepository;
}

export const CampaignActionItemsPage = ({ campaignId, repository }: CampaignActionItemsPageProps): JSX.Element => {
  const resolvedRepository = useMemo(() => repository ?? new CampaignActionItemsHttpRepository(), [repository]);
  const { state, load, create, update, updateStatus, destroy, clearError } = useCampaignActionItems({
    campaignId,
    repository: resolvedRepository
  });
  const [filters, setFilters] = useState<CampaignActionItemFilters>({ page: 1, perPage: 20 });
  const [editingActionItem, setEditingActionItem] = useState<CampaignActionItem | undefined>();
  const [deletingActionItem, setDeletingActionItem] = useState<CampaignActionItem | null>(null);

  useEffect(() => {
    void load(filters);
  }, [filters, load]);

  const handleCreateOrUpdate = async (input: CampaignActionItemInput): Promise<void> => {
    if (editingActionItem) {
      const didSave = await update(editingActionItem.id, input);
      if (!didSave) {
        return;
      }

      setEditingActionItem(undefined);
      await load(filters);
      return;
    }

    if (await create(input)) {
      await load(filters);
    }
  };

  const handleStatusChange = async (actionItemId: number, status: CampaignActionItemStatus): Promise<void> => {
    if (await updateStatus(actionItemId, status)) {
      await load(filters);
    }
  };

  const handleDelete = async (actionItemId: number): Promise<void> => {
    if (await destroy(actionItemId)) {
      setDeletingActionItem(null);
      await load(filters);
    }
  };

  const handlePageChange = (paginationFilters: CampaignActionItemFilters): void => {
    setFilters((currentFilters) => ({ ...currentFilters, ...paginationFilters }));
  };

  return (
    <main className="campaign-action-items-page">
      <header>
        <h1>Đầu việc chiến dịch</h1>
        <p>Quản lý các đầu việc vận hành cho chiến dịch #{campaignId}.</p>
      </header>
      <SummaryChips summary={state.summary} />
      <ActionItemFilters initialFilters={filters} onSubmit={setFilters} />
      {state.error ? (
        <section aria-label="Lỗi đầu việc chiến dịch" role="alert">
          <button onClick={clearError} type="button">
            Đóng
          </button>
          Không tải được dữ liệu. Kiểm tra API hoặc dùng demo mock mặc định.
        </section>
      ) : null}
      {state.isLoading ? <p>Đang tải đầu việc chiến dịch...</p> : null}
      <ActionItemForm
        actionItem={editingActionItem}
        errors={state.error?.details}
        isSaving={state.isSaving}
        onCancel={editingActionItem ? () => setEditingActionItem(undefined) : undefined}
        onSubmit={(input) => {
          void handleCreateOrUpdate(input);
        }}
      />
      <ActionItemList
        actionItems={state.actionItems}
        isSaving={state.isSaving}
        onDelete={setDeletingActionItem}
        onEdit={setEditingActionItem}
        onStatusChange={(actionItemId, status) => {
          void handleStatusChange(actionItemId, status);
        }}
      />
      <PaginationControls pagination={state.pagination} onChange={handlePageChange} />
      <DeleteConfirmation
        actionItem={deletingActionItem}
        isSaving={state.isSaving}
        onCancel={() => setDeletingActionItem(null)}
        onConfirm={(actionItemId) => {
          void handleDelete(actionItemId);
        }}
      />
    </main>
  );
};
