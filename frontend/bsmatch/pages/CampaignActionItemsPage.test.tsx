import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignActionItemsPage } from './CampaignActionItemsPage';
import type { CampaignActionItem, CampaignActionItemsListResult } from '../domains/campaignActionItems/entities';
import type { AdminAuthRepository } from '../repositories/adminAuthRepository';
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

const buildGuestAuthRepository = (): jest.Mocked<AdminAuthRepository> => ({
  authenticate: jest.fn().mockResolvedValue(null),
  logout: jest.fn().mockResolvedValue(undefined)
});

const buildLoggedInAuthRepository = (): jest.Mocked<AdminAuthRepository> => ({
  authenticate: jest.fn().mockResolvedValue({ id: 7, email: 'admin@example.com' }),
  logout: jest.fn().mockResolvedValue(undefined)
});

describe('CampaignActionItemsPage', () => {
  it('loads and renders campaign action item data', async () => {
    const repository = buildRepository();

    render(<CampaignActionItemsPage authRepository={buildLoggedInAuthRepository()} campaignId={10} repository={repository} />);

    expect(await screen.findByText('Confirm creator shortlist')).toBeInTheDocument();
    expect(screen.getByText('Tổng')).toBeInTheDocument();
    expect(screen.getByText('Trang 1 / 2')).toBeInTheDocument();
    expect(repository.list).toHaveBeenCalledWith(10, { page: 1, perPage: 20 });
  });

  it('renders signup and login links for guest admins', async () => {
    const repository = buildRepository();

    render(<CampaignActionItemsPage authRepository={buildGuestAuthRepository()} campaignId={10} repository={repository} />);

    expect(await screen.findByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/admins/sign_in');
    expect(screen.getByRole('link', { name: 'Đăng ký' })).toHaveAttribute('href', '/admins/sign_up');
    expect(screen.getByRole('status')).toHaveTextContent('Bạn cần đăng nhập admin để xem dữ liệu chiến dịch.');
    expect(screen.queryByText('Confirm creator shortlist')).not.toBeInTheDocument();
    expect(repository.list).not.toHaveBeenCalled();
  });

  it('renders logout for signed-in admins', async () => {
    const user = userEvent.setup();
    const repository = buildRepository();
    const authRepository = buildLoggedInAuthRepository();

    render(<CampaignActionItemsPage authRepository={authRepository} campaignId={10} repository={repository} />);

    expect(await screen.findByText('admin@example.com')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }));

    expect(authRepository.logout).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.queryByText('Confirm creator shortlist')).not.toBeInTheDocument();
  });

  it('submits filters, inline status updates, creates, and deletes through the repository', async () => {
    const user = userEvent.setup();
    const repository = buildRepository();

    render(<CampaignActionItemsPage authRepository={buildLoggedInAuthRepository()} campaignId={10} repository={repository} />);
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
