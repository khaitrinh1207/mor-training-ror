import type { CampaignActionItemFilters, CampaignActionItemPagination } from '../../domains/campaignActionItems/entities';

export interface PaginationControlsProps {
  pagination: CampaignActionItemPagination;
  onChange: (filters: CampaignActionItemFilters) => void;
}

export const PaginationControls = ({ pagination, onChange }: PaginationControlsProps): JSX.Element => {
  const canGoPrevious = pagination.currentPage > 1;
  const canGoNext = pagination.currentPage < pagination.totalPages;

  return (
    <nav aria-label="Phân trang đầu việc chiến dịch" className="campaign-action-item-pagination">
      <button
        disabled={!canGoPrevious}
        onClick={() => onChange({ page: pagination.currentPage - 1, perPage: pagination.perPage })}
        type="button"
      >
        Trước
      </button>
      <span>
        Trang {pagination.currentPage} / {pagination.totalPages}
      </span>
      <button
        disabled={!canGoNext}
        onClick={() => onChange({ page: pagination.currentPage + 1, perPage: pagination.perPage })}
        type="button"
      >
        Sau
      </button>
    </nav>
  );
};
