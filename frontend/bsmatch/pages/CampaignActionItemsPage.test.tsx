import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignActionItemsPage } from './CampaignActionItemsPage';
import type { CampaignActionItem, CampaignActionItemsListResult } from '../domains/campaignActionItems/entities';
import type { CampaignActionItemsRepository } from '../repositories/campaignActionItemsRepository';

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

const listResult: CampaignActionItemsListResult = {
  actionItems: [actionItem],
  summary: {
    totalCount: 1,
    todoCount: 1,
    doingCount: 0,
    doneCount: 0,
    overdueCount: 0
  },
  pagination: {
    count: 1,
    currentPage: 1,
    totalPages: 2,
    totalCount: 2,
    perPage: 1
  }
};

const buildRepository = (): jest.Mocked<CampaignActionItemsRepository> => ({
  list: jest.fn().mockResolvedValue(listResult),
  create: jest.fn().mockResolvedValue({ ...actionItem, id: 2, title: 'New action item' }),
  update: jest.fn().mockResolvedValue({ ...actionItem, status: 'doing' }),
  destroy: jest.fn().mockResolvedValue(undefined)
});

describe('CampaignActionItemsPage', () => {
  it('loads and renders campaign action item data', async () => {
    const repository = buildRepository();

    render(<CampaignActionItemsPage campaignId={10} repository={repository} />);

    expect(await screen.findByText('Confirm creator shortlist')).toBeInTheDocument();
    expect(screen.getByText('Tổng')).toBeInTheDocument();
    expect(screen.getByText('Trang 1 / 2')).toBeInTheDocument();
    expect(repository.list).toHaveBeenCalledWith(10, { page: 1, perPage: 20 });
  });

  it('submits filters, inline status updates, creates, and deletes through the repository', async () => {
    const user = userEvent.setup();
    const repository = buildRepository();

    render(<CampaignActionItemsPage campaignId={10} repository={repository} />);
    await screen.findByText('Confirm creator shortlist');

    const filterForm = screen.getByRole('form', { name: 'Lọc đầu việc chiến dịch' });

    await user.type(within(filterForm).getByLabelText('Từ khóa'), 'shortlist');
    await user.selectOptions(within(filterForm).getByLabelText('Trạng thái'), 'todo');
    await user.click(screen.getByRole('button', { name: 'Lọc' }));

    await waitFor(() => {
      expect(repository.list).toHaveBeenLastCalledWith(
        10,
        expect.objectContaining({ q: 'shortlist', status: 'todo', page: 1 })
      );
    });

    await user.selectOptions(screen.getByLabelText('Trạng thái của Confirm creator shortlist'), 'doing');
    expect(repository.update).toHaveBeenCalledWith(10, 1, { status: 'doing' });
    await waitFor(() => {
      expect(repository.list).toHaveBeenLastCalledWith(
        10,
        expect.objectContaining({ q: 'shortlist', status: 'todo', page: 1 })
      );
    });

    await user.clear(screen.getByLabelText('Tiêu đề'));
    await user.type(screen.getByLabelText('Tiêu đề'), 'New action item');
    await user.click(screen.getByRole('button', { name: 'Tạo đầu việc' }));
    expect(repository.create).toHaveBeenCalledWith(10, expect.objectContaining({ title: 'New action item' }));
    await waitFor(() => {
      expect(repository.list).toHaveBeenLastCalledWith(
        10,
        expect.objectContaining({ q: 'shortlist', status: 'todo', page: 1 })
      );
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Xóa' });
    await user.click(deleteButtons[deleteButtons.length - 1]);
    await user.click(screen.getByRole('button', { name: 'Xác nhận xóa' }));
    expect(repository.destroy).toHaveBeenCalledWith(10, 1);
    await waitFor(() => {
      expect(repository.list).toHaveBeenLastCalledWith(
        10,
        expect.objectContaining({ q: 'shortlist', status: 'todo', page: 1 })
      );
    });
  });
});
