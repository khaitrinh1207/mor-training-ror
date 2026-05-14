require 'rails_helper'

RSpec.describe CampaignActionItems::SearchIndex do
  let(:campaign) { create(:campaign) }
  let(:admin) { create(:admin) }
  let(:action_item) do
    create(
      :campaign_action_item,
      campaign:,
      created_by_admin: admin,
      title: 'Confirm creator shortlist',
      memo: 'Review candidate list before client meeting.',
      status: :doing,
      due_date: '2026-05-15'
    )
  end
  let(:client) { double('OpenSearch client') }
  let(:service) { described_class.new(action_item:, client:) }

  describe '#index' do
    it 'indexes the action item document' do
      expect(client).to receive(:index).with(
        index: 'campaign_action_items-test',
        id: action_item.id,
        body: expected_document
      )

      service.index
    end
  end

  describe '#update' do
    it 'refreshes the action item document' do
      expect(client).to receive(:update).with(
        index: 'campaign_action_items-test',
        id: action_item.id,
        body: { doc: expected_document }
      )

      service.update
    end
  end

  describe '#delete' do
    it 'removes the action item document' do
      expect(client).to receive(:delete).with(
        index: 'campaign_action_items-test',
        id: action_item.id
      )

      service.delete
    end
  end

  def expected_document
    {
      id: action_item.id,
      campaign_id: campaign.id,
      title: 'Confirm creator shortlist',
      memo: 'Review candidate list before client meeting.',
      status: 'doing',
      due_date: '2026-05-15',
      created_by_admin_id: admin.id,
      created_at: action_item.created_at.iso8601,
      updated_at: action_item.updated_at.iso8601
    }
  end
end
