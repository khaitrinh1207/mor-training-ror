import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type {
  CampaignActionItem,
  CampaignActionItemInput,
  CampaignActionItemStatus,
  CampaignActionItemsFieldErrors
} from '../../domains/campaignActionItems/entities';
import { campaignActionItemStatusLabels, campaignActionItemStatuses } from '../../domains/campaignActionItems/entities';

export interface ActionItemFormProps {
  actionItem?: CampaignActionItem;
  errors?: CampaignActionItemsFieldErrors;
  isSaving: boolean;
  onCancel?: () => void;
  onSubmit: (input: CampaignActionItemInput) => void;
}

export const ActionItemForm = ({ actionItem, errors, isSaving, onCancel, onSubmit }: ActionItemFormProps): JSX.Element => {
  const [input, setInput] = useState<CampaignActionItemInput>({
    title: actionItem?.title ?? '',
    memo: actionItem?.memo ?? '',
    status: actionItem?.status ?? 'todo',
    dueDate: actionItem?.dueDate ?? ''
  });

  useEffect(() => {
    setInput({
      title: actionItem?.title ?? '',
      memo: actionItem?.memo ?? '',
      status: actionItem?.status ?? 'todo',
      dueDate: actionItem?.dueDate ?? ''
    });
  }, [actionItem]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit(input);
  };

  return (
    <form aria-label={actionItem ? 'Sửa đầu việc' : 'Tạo đầu việc'} className="campaign-action-item-form" onSubmit={handleSubmit}>
      <label>
        Tiêu đề
        <input
          aria-invalid={Boolean(errors?.title)}
          name="title"
          onChange={(event) => setInput({ ...input, title: event.currentTarget.value })}
          required
          value={input.title}
        />
      </label>
      {errors?.title ? <p role="alert">{errors.title.join(', ')}</p> : null}
      <label>
        Ghi chú
        <textarea
          name="memo"
          onChange={(event) => setInput({ ...input, memo: event.currentTarget.value })}
          value={input.memo}
        />
      </label>
      <label>
        Trạng thái
        <select
          name="status"
          onChange={(event) => setInput({ ...input, status: event.currentTarget.value as CampaignActionItemStatus })}
          value={input.status}
        >
          {campaignActionItemStatuses.map((status) => (
            <option key={status} value={status}>
              {campaignActionItemStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Hạn xử lý
        <input
          name="dueDate"
          onChange={(event) => setInput({ ...input, dueDate: event.currentTarget.value })}
          type="date"
          value={input.dueDate}
        />
      </label>
      <div className="campaign-action-item-form__actions">
        <button disabled={isSaving} type="submit">
          {actionItem ? 'Lưu đầu việc' : 'Tạo đầu việc'}
        </button>
        {onCancel ? (
          <button disabled={isSaving} onClick={onCancel} type="button">
            Hủy
          </button>
        ) : null}
      </div>
    </form>
  );
};
