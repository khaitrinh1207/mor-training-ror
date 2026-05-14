import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CampaignActionItem } from '../../domains/campaignActionItems/entities';
import { ActionItemList } from './ActionItemList';

const actionItem: CampaignActionItem = {
  id: 1,
  campaignId: 10,
  title: 'Confirm creator shortlist',
  memo: 'Review candidate list before client meeting.',
  status: 'todo',
  dueDate: '2026-05-15',
  createdByAdminId: 3,
  createdAt: '2026-05-12T10:00:00.000Z',
  updatedAt: '2026-05-12T10:00:00.000Z'
};

describe('ActionItemList', () => {
  it('renders action items and emits inline status changes', async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();

    render(
      <ActionItemList
        actionItems={[actionItem]}
        isSaving={false}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByText('Confirm creator shortlist')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Trạng thái của Confirm creator shortlist'), 'doing');

    expect(onStatusChange).toHaveBeenCalledWith(1, 'doing');
  });

  it('emits edit and delete actions', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <ActionItemList
        actionItems={[actionItem]}
        isSaving={false}
        onDelete={onDelete}
        onEdit={onEdit}
        onStatusChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Sửa' }));
    await user.click(screen.getByRole('button', { name: 'Xóa' }));

    expect(onEdit).toHaveBeenCalledWith(actionItem);
    expect(onDelete).toHaveBeenCalledWith(actionItem);
  });
});
