require 'rails_helper'

RSpec.describe CampaignActionItems::Filterable do
  let(:campaign) { create(:campaign) }

  describe '.with_status' do
    it 'filters action items by status' do
      todo_item = create(:campaign_action_item, campaign:, status: :todo)
      create(:campaign_action_item, campaign:, status: :doing)

      expect(CampaignActionItem.with_status('todo')).to contain_exactly(todo_item)
    end
  end

  describe '.due_on_or_after' do
    it 'filters action items with due dates on or after the given date' do
      create(:campaign_action_item, campaign:, due_date: '2026-05-10')
      matching_item = create(:campaign_action_item, campaign:, due_date: '2026-05-12')

      expect(CampaignActionItem.due_on_or_after(Date.iso8601('2026-05-12'))).to contain_exactly(matching_item)
    end
  end

  describe '.due_on_or_before' do
    it 'filters action items with due dates on or before the given date' do
      matching_item = create(:campaign_action_item, campaign:, due_date: '2026-05-12')
      create(:campaign_action_item, campaign:, due_date: '2026-05-20')

      expect(CampaignActionItem.due_on_or_before(Date.iso8601('2026-05-12'))).to contain_exactly(matching_item)
    end
  end

  describe '.ordered_for_admin_list' do
    it 'orders by due date ascending and created date descending' do
      later_item = create(:campaign_action_item, campaign:, due_date: '2026-05-20', created_at: 2.days.ago)
      earlier_item = create(:campaign_action_item, campaign:, due_date: '2026-05-10', created_at: 1.day.ago)

      expect(CampaignActionItem.ordered_for_admin_list).to eq([earlier_item, later_item])
    end
  end
end
