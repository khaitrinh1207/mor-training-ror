import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import type {
  CampaignActionItemFilters,
  CampaignActionItemStatus
} from '../../domains/campaignActionItems/entities';
import { campaignActionItemStatusLabels, campaignActionItemStatuses } from '../../domains/campaignActionItems/entities';

export interface ActionItemFiltersProps {
  initialFilters?: CampaignActionItemFilters;
  onSubmit: (filters: CampaignActionItemFilters) => void;
}

export const ActionItemFilters = ({ initialFilters = {}, onSubmit }: ActionItemFiltersProps): JSX.Element => {
  const [filters, setFilters] = useState<CampaignActionItemFilters>(initialFilters);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({ ...filters, page: 1 });
  };

  const updateField = (field: keyof CampaignActionItemFilters, value: string): void => {
    setFilters((currentFilters) => ({ ...currentFilters, [field]: value || undefined }));
  };

  const updateStatus = (event: ChangeEvent<HTMLSelectElement>): void => {
    updateField('status', event.currentTarget.value as CampaignActionItemStatus);
  };

  return (
    <form aria-label="Lọc đầu việc chiến dịch" className="campaign-action-item-filters" onSubmit={handleSubmit}>
      <label>
        Từ khóa
        <input
          name="q"
          onChange={(event) => updateField('q', event.currentTarget.value)}
          placeholder="Tìm theo tiêu đề hoặc ghi chú"
          type="search"
          value={filters.q ?? ''}
        />
      </label>
      <label>
        Trạng thái
        <select name="status" onChange={updateStatus} value={filters.status ?? ''}>
          <option value="">Tất cả trạng thái</option>
          {campaignActionItemStatuses.map((status) => (
            <option key={status} value={status}>
              {campaignActionItemStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Từ hạn
        <input
          name="dueDateFrom"
          onChange={(event) => updateField('dueDateFrom', event.currentTarget.value)}
          type="date"
          value={filters.dueDateFrom ?? ''}
        />
      </label>
      <label>
        Đến hạn
        <input
          name="dueDateTo"
          onChange={(event) => updateField('dueDateTo', event.currentTarget.value)}
          type="date"
          value={filters.dueDateTo ?? ''}
        />
      </label>
      <button type="submit">Lọc</button>
    </form>
  );
};
