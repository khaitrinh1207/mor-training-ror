require 'rails_helper'

RSpec.describe CampaignActionItems::KeywordSearch do
  let(:campaign) { create(:campaign) }
  let(:client) { double('OpenSearch client') }

  describe '#call' do
    it 'returns matching records in OpenSearch result order' do
      first_match = create(:campaign_action_item, campaign:, title: 'Prepare shortlist memo')
      second_match = create(:campaign_action_item, campaign:, title: 'Confirm creator shortlist')
      create(:campaign_action_item, campaign:, title: 'Unrelated task')

      expect(client).to receive(:search).with(
        index: 'campaign_action_items-test',
        body: {
          query: {
            bool: {
              filter: [
                { term: { campaign_id: campaign.id } }
              ],
              must: [
                {
                  multi_match: {
                    query: 'shortlist',
                    fields: %w[title memo]
                  }
                }
              ]
            }
          }
        }
      ).and_return(
        'hits' => {
          'hits' => [
            { '_id' => second_match.id.to_s },
            { '_source' => { 'id' => first_match.id } }
          ]
        }
      )

      result = described_class.new(campaign:, q: 'shortlist', client:).call

      expect(result).to be_a(ActiveRecord::Relation)
      expect(result.to_a).to eq([second_match, first_match])
    end

    it 'falls back to MySQL LIKE search when OpenSearch fails' do
      title_match = create(:campaign_action_item, campaign:, title: 'Confirm creator shortlist', memo: 'Call owner')
      memo_match = create(:campaign_action_item, campaign:, title: 'Prepare meeting', memo: 'Shortlist is ready')
      create(:campaign_action_item, campaign:, title: 'Prepare campaign memo', memo: 'Call owner')
      create(:campaign_action_item, title: 'Confirm creator shortlist')

      allow(client).to receive(:search).and_raise(StandardError, 'search unavailable')

      result = described_class.new(campaign:, q: 'shortlist', client:).call

      expect(result).to be_a(ActiveRecord::Relation)
      expect(result).to contain_exactly(title_match, memo_match)
    end

    it 'returns the campaign relation without OpenSearch when q is blank' do
      action_item = create(:campaign_action_item, campaign:)
      create(:campaign_action_item)

      expect(client).not_to receive(:search)

      result = described_class.new(campaign:, q: ' ', client:).call

      expect(result).to be_a(ActiveRecord::Relation)
      expect(result).to contain_exactly(action_item)
    end
  end
end
