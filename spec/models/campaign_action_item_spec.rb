require 'rails_helper'

RSpec.describe CampaignActionItem, type: :model do
  describe 'associations' do
    it 'belongs to a campaign' do
      association = described_class.reflect_on_association(:campaign)

      expect(association.macro).to eq(:belongs_to)
    end

    it 'belongs to created_by_admin optionally' do
      association = described_class.reflect_on_association(:created_by_admin)

      expect(association.macro).to eq(:belongs_to)
      expect(association.options[:class_name]).to eq('Admin')
      expect(association.options[:optional]).to eq(true)
    end
  end

  describe 'validations' do
    it 'is valid with default factory' do
      expect(build(:campaign_action_item)).to be_valid
    end

    it 'requires a campaign' do
      action_item = build(:campaign_action_item, campaign: nil)

      expect(action_item).not_to be_valid
      expect(action_item.errors[:campaign]).to include('must exist')
    end

    it 'requires a title' do
      action_item = build(:campaign_action_item, title: nil)

      expect(action_item).not_to be_valid
      expect(action_item.errors[:title]).to include("can't be blank")
    end
  end

  describe 'enums' do
    it 'defines status enum values' do
      expect(described_class.statuses).to eq(
        'todo' => 0,
        'doing' => 1,
        'done' => 2
      )
    end

    it 'uses prefixed enum predicate methods' do
      action_item = build(:campaign_action_item, status: :todo)

      expect(action_item.status_todo?).to eq(true)
      expect(action_item.status_doing?).to eq(false)
      expect(action_item.status_done?).to eq(false)
    end
  end
  describe 'audit callbacks' do
    it 'creates an audit log after create commit' do
      expect do
        create(:campaign_action_item, title: 'Create checklist')
      end.to change(CampaignActionItemAuditLog, :count).by(1)

      audit_log = CampaignActionItemAuditLog.last
      expect(audit_log).to have_attributes(
        event: 'created',
        title: 'Create checklist',
        status: 'todo'
      )
    end

    it 'creates an audit log after update commit' do
      action_item = create(:campaign_action_item, title: 'Before update', status: :todo)
      CampaignActionItemAuditLog.delete_all

      expect do
        action_item.update!(title: 'After update', status: :doing)
      end.to change(CampaignActionItemAuditLog, :count).by(1)

      audit_log = CampaignActionItemAuditLog.last
      expect(audit_log).to have_attributes(
        campaign_action_item_id: action_item.id,
        event: 'updated',
        title: 'After update',
        status: 'doing'
      )
    end
  end

end
