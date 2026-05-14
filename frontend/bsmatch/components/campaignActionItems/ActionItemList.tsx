import type {
  CampaignActionItem,
  CampaignActionItemStatus
} from '../../domains/campaignActionItems/entities';
import { campaignActionItemStatusLabels, campaignActionItemStatuses } from '../../domains/campaignActionItems/entities';

export interface ActionItemListProps {
  actionItems: CampaignActionItem[];
  isSaving: boolean;
  onDelete: (actionItem: CampaignActionItem) => void;
  onEdit: (actionItem: CampaignActionItem) => void;
  onStatusChange: (actionItemId: number, status: CampaignActionItemStatus) => void;
}

export const ActionItemList = ({
  actionItems,
  isSaving,
  onDelete,
  onEdit,
  onStatusChange
}: ActionItemListProps): JSX.Element => {
  if (actionItems.length === 0) {
    return <p>Không tìm thấy đầu việc nào.</p>;
  }

  return (
    <table className="campaign-action-item-list">
      <caption>Danh sách đầu việc</caption>
      <thead>
        <tr>
          <th scope="col">Tiêu đề</th>
          <th scope="col">Ghi chú</th>
          <th scope="col">Trạng thái</th>
          <th scope="col">Hạn xử lý</th>
          <th scope="col">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {actionItems.map((actionItem) => (
          <tr key={actionItem.id}>
            <td>{actionItem.title}</td>
            <td>{actionItem.memo || '-'}</td>
            <td>
              <select
                aria-label={`Trạng thái của ${actionItem.title}`}
                disabled={isSaving}
                onChange={(event) => onStatusChange(actionItem.id, event.currentTarget.value as CampaignActionItemStatus)}
                value={actionItem.status}
              >
                {campaignActionItemStatuses.map((status) => (
                  <option key={status} value={status}>
                    {campaignActionItemStatusLabels[status]}
                  </option>
                ))}
              </select>
            </td>
            <td>{actionItem.dueDate || '-'}</td>
            <td>
              <button disabled={isSaving} onClick={() => onEdit(actionItem)} type="button">
                Sửa
              </button>
              <button disabled={isSaving} onClick={() => onDelete(actionItem)} type="button">
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
