import type { CampaignActionItemSummary } from '../../domains/campaignActionItems/entities';

export interface SummaryChipsProps {
  summary: CampaignActionItemSummary;
}

export const SummaryChips = ({ summary }: SummaryChipsProps): JSX.Element => {
  const chips = [
    { label: 'Tổng', value: summary.totalCount },
    { label: 'Cần làm', value: summary.todoCount },
    { label: 'Đang làm', value: summary.doingCount },
    { label: 'Hoàn thành', value: summary.doneCount },
    { label: 'Quá hạn', value: summary.overdueCount }
  ];

  return (
    <section aria-label="Tổng quan đầu việc chiến dịch" className="campaign-action-item-summary">
      {chips.map((chip) => (
        <span className="campaign-action-item-summary__chip" key={chip.label}>
          <span>{chip.label}</span>
          <strong>{chip.value}</strong>
        </span>
      ))}
    </section>
  );
};
