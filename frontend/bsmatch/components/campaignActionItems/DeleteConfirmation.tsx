import type { CampaignActionItem } from '../../domains/campaignActionItems/entities';

export interface DeleteConfirmationProps {
  actionItem: CampaignActionItem | null;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (actionItemId: number) => void;
}

export const DeleteConfirmation = ({ actionItem, isSaving, onCancel, onConfirm }: DeleteConfirmationProps): JSX.Element | null => {
  if (!actionItem) {
    return null;
  }

  return (
    <section aria-label="Xác nhận xóa đầu việc" className="campaign-action-item-delete-confirmation">
      <p>
        Xóa <strong>{actionItem.title}</strong>?
      </p>
      <button disabled={isSaving} onClick={() => onConfirm(actionItem.id)} type="button">
        Xác nhận xóa
      </button>
      <button disabled={isSaving} onClick={onCancel} type="button">
        Hủy
      </button>
    </section>
  );
};
