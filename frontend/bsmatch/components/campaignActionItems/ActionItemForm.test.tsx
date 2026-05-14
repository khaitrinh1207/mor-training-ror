import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionItemForm } from './ActionItemForm';

describe('ActionItemForm', () => {
  it('submits create input using frontend entity names', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ActionItemForm isSaving={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Tiêu đề'), 'Confirm creator shortlist');
    await user.type(screen.getByLabelText('Ghi chú'), 'Review candidate list before client meeting.');
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'doing');
    await user.type(screen.getByLabelText('Hạn xử lý'), '2026-05-15');
    await user.click(screen.getByRole('button', { name: 'Tạo đầu việc' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Confirm creator shortlist',
      memo: 'Review candidate list before client meeting.',
      status: 'doing',
      dueDate: '2026-05-15'
    });
  });

  it('syncs input values when the edited action item changes', () => {
    const { rerender } = render(
      <ActionItemForm
        actionItem={{
          id: 1,
          campaignId: 10,
          title: 'First item',
          memo: 'First memo',
          status: 'todo',
          dueDate: '2026-05-15',
          createdByAdminId: 3,
          createdAt: '2026-05-12T10:00:00.000Z',
          updatedAt: '2026-05-12T10:00:00.000Z'
        }}
        isSaving={false}
        onSubmit={jest.fn()}
      />
    );

    rerender(
      <ActionItemForm
        actionItem={{
          id: 2,
          campaignId: 10,
          title: 'Second item',
          memo: 'Second memo',
          status: 'doing',
          dueDate: '2026-05-20',
          createdByAdminId: 3,
          createdAt: '2026-05-12T10:00:00.000Z',
          updatedAt: '2026-05-12T10:00:00.000Z'
        }}
        isSaving={false}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Tiêu đề')).toHaveValue('Second item');
    expect(screen.getByLabelText('Ghi chú')).toHaveValue('Second memo');
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('doing');
    expect(screen.getByLabelText('Hạn xử lý')).toHaveValue('2026-05-20');
  });
});
