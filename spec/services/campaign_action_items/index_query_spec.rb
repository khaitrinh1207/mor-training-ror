require 'rails_helper'

RSpec.describe CampaignActionItems::IndexQuery do
  describe '#call' do
    let(:campaign) { create(:campaign) }

    it 'filters by status, due date range, and keyword' do
      matching_item = create(
        :campaign_action_item,
        campaign:,
        title: 'Confirm creator shortlist',
        status: :doing,
        due_date: '2026-05-15'
      )
      create(:campaign_action_item, campaign:, title: 'Confirm creator shortlist', status: :todo, due_date: '2026-05-15')
      create(:campaign_action_item, campaign:, title: 'Confirm creator shortlist', status: :doing, due_date: '2026-05-21')
      create(:campaign_action_item, campaign:, title: 'Prepare campaign memo', status: :doing, due_date: '2026-05-15')
      create(:campaign_action_item, title: 'Confirm creator shortlist', status: :doing, due_date: '2026-05-15')

      result = described_class.new(
        campaign:,
        params: {
          q: 'shortlist',
          status: 'doing',
          due_date_from: '2026-05-12',
          due_date_to: '2026-05-20'
        }
      ).call

      expect(result).to contain_exactly(matching_item)
    end

    it 'uses keyword search when q is present' do
      search_scope = campaign.campaign_action_items.where(id: create(:campaign_action_item, campaign:).id)
      keyword_search = instance_double(CampaignActionItems::KeywordSearch, call: search_scope)

      expect(CampaignActionItems::KeywordSearch).to receive(:new).with(campaign:, q: 'shortlist').and_return(keyword_search)

      result = described_class.new(campaign:, params: { q: 'shortlist' }).call

      expect(result.to_a).to eq(search_scope.order(due_date: :asc, created_at: :desc).to_a)
    end

    it 'raises invalid parameter for unknown status' do
      query = described_class.new(campaign:, params: { status: 'blocked' })

      expect { query.call }.to raise_error(
        CampaignActionItems::IndexQuery::InvalidParameter,
        'status is not included in the list'
      )
    end

    it 'raises invalid parameter for malformed due date' do
      query = described_class.new(campaign:, params: { due_date_to: 'May 20, 2026' })

      expect { query.call }.to raise_error(
        CampaignActionItems::IndexQuery::InvalidParameter,
        'due_date_to must be a valid date in YYYY-MM-DD format'
      )
    end
  end
end
