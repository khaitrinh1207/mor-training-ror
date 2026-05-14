require 'rails_helper'

RSpec.describe CampaignActionItemAuditLog, type: :model do
  describe 'associations' do
    it 'belongs to a campaign action item' do
      association = described_class.reflect_on_association(:campaign_action_item)

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
      expect(build(:campaign_action_item_audit_log)).to be_valid
    end

    it 'requires an event' do
      audit_log = build(:campaign_action_item_audit_log, event: nil)

      expect(audit_log).not_to be_valid
      expect(audit_log.errors[:event]).to include("can't be blank")
    end

    it 'requires a title' do
      audit_log = build(:campaign_action_item_audit_log, title: nil)

      expect(audit_log).not_to be_valid
      expect(audit_log.errors[:title]).to include("can't be blank")
    end

    it 'requires a status' do
      audit_log = build(:campaign_action_item_audit_log, status: nil)

      expect(audit_log).not_to be_valid
      expect(audit_log.errors[:status]).to include("can't be blank")
    end
  end
end
