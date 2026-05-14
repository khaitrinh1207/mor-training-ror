require 'rails_helper'

RSpec.describe Campaign, type: :model do
  describe 'associations' do
    it 'has many campaign action items' do
      association = described_class.reflect_on_association(:campaign_action_items)

      expect(association.macro).to eq(:has_many)
      expect(association.options[:dependent]).to eq(:destroy)
    end
  end

  describe 'validations' do
    it 'is valid with a name' do
      expect(build(:campaign)).to be_valid
    end

    it 'requires a name' do
      campaign = build(:campaign, name: nil)

      expect(campaign).not_to be_valid
      expect(campaign.errors[:name]).to include("can't be blank")
    end
  end
end
