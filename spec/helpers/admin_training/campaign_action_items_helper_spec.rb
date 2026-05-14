require 'rails_helper'

RSpec.describe AdminTraining::CampaignActionItemsHelper, type: :helper do
  describe '#status_badge_label' do
    it 'returns an uppercase status label' do
      action_item = build(:campaign_action_item, status: :doing)

      expect(helper.status_badge_label(action_item)).to eq('DOING')
    end
  end

  describe '#action_item_due_date_label' do
    it 'formats a present due date' do
      action_item = build(:campaign_action_item, due_date: Date.iso8601('2026-05-14'))

      expect(helper.action_item_due_date_label(action_item)).to eq('2026-05-14')
    end

    it 'returns a fallback for blank due date' do
      action_item = build(:campaign_action_item, due_date: nil)

      expect(helper.action_item_due_date_label(action_item)).to eq('No due date')
    end
  end
end
