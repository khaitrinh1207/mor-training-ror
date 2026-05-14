require 'rails_helper'

RSpec.describe 'Admin campaign action items API', type: :request do
  let(:admin) { create(:admin) }
  let(:campaign) { create(:campaign) }

  before do
    sign_in admin
  end

  describe 'GET /match/api/v2/admin/campaigns/:campaign_id/action_items' do
    it 'returns action items for the campaign' do
      create(:campaign_action_item, campaign:, title: 'Confirm creator shortlist', status: :todo)
      create(:campaign_action_item, title: 'Other campaign item')

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_items'].size).to eq(1)
      expect(body['campaign_action_items'][0]).to include(
        'campaign_id' => campaign.id,
        'title' => 'Confirm creator shortlist',
        'status' => 'todo'
      )
    end

    it 'returns creator email without per-row admin lookup' do
      first_creator = create(:admin, email: 'first.creator@example.com')
      second_creator = create(:admin, email: 'second.creator@example.com')
      third_creator = create(:admin, email: 'third.creator@example.com')
      create(:campaign_action_item, campaign:, title: 'First item', created_by_admin: first_creator)
      create(:campaign_action_item, campaign:, title: 'Second item', created_by_admin: second_creator)
      create(:campaign_action_item, campaign:, title: 'Third item', created_by_admin: third_creator)
      admin_lookup_queries = []
      callback = lambda do |_name, _started, _finished, _unique_id, payload|
        sql = payload[:sql].to_s
        next if payload[:name] == 'SCHEMA'
        next unless sql.match?(/SELECT .* FROM [`\"]?admins[`\"]?/i)
        next unless sql.match?(/WHERE .*[`\"]?admins[`\"]?\.[`\"]?id[`\"]? =/i)

        admin_lookup_queries << sql
      end

      ActiveSupport::Notifications.subscribed(callback, 'sql.active_record') do
        get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"
      end

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_items'].map { |item| item['created_by_admin_email'] }).to contain_exactly(
        'first.creator@example.com',
        'second.creator@example.com',
        'third.creator@example.com'
      )
      expect(admin_lookup_queries.size).to be <= 1
    end

    it 'returns summary counts and pagination metadata' do
      create(:campaign_action_item, campaign:, status: :todo, due_date: Date.current - 1.day)
      create(:campaign_action_item, campaign:, status: :doing)
      create(:campaign_action_item, campaign:, status: :done)

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: { page: 1, per_page: 2 }

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_items'].size).to eq(2)
      expect(body['summary']).to eq(
        'total_count' => 3,
        'todo_count' => 1,
        'doing_count' => 1,
        'done_count' => 1,
        'overdue_count' => 1
      )
      expect(body['pagination']).to eq(
        'count' => 2,
        'current_page' => 1,
        'total_pages' => 2,
        'total_count' => 3,
        'per_page' => 2
      )
    end

    it 'filters action items by status' do
      create(:campaign_action_item, campaign:, title: 'Todo item', status: :todo)
      create(:campaign_action_item, campaign:, title: 'Doing item', status: :doing)

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: { status: 'doing' }

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_items'].map { |item| item['title'] }).to eq(['Doing item'])
      expect(body['summary']).to include(
        'total_count' => 2,
        'todo_count' => 1,
        'doing_count' => 1,
        'done_count' => 0
      )
    end

    it 'filters action items by due date range' do
      create(:campaign_action_item, campaign:, title: 'Too early', due_date: '2026-05-10')
      create(:campaign_action_item, campaign:, title: 'In range', due_date: '2026-05-15')
      create(:campaign_action_item, campaign:, title: 'Too late', due_date: '2026-05-21')

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: {
        due_date_from: '2026-05-12',
        due_date_to: '2026-05-20'
      }

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_items'].map { |item| item['title'] }).to eq(['In range'])
    end

    it 'filters action items by keyword' do
      create(:campaign_action_item, campaign:, title: 'Confirm creator shortlist')
      create(:campaign_action_item, campaign:, title: 'Prepare campaign memo')

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: { q: 'shortlist' }

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_items'].map { |item| item['title'] }).to eq(['Confirm creator shortlist'])
    end

    it 'returns invalid parameter error for unknown status filter' do
      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: { status: 'blocked' }

      expect(response).to have_http_status(:bad_request)

      body = JSON.parse(response.body)
      expect(body['error']).to include(
        'code' => 'invalid_parameter',
        'message' => 'Invalid request parameter.'
      )
      expect(body['error']['details']).to include('status' => ['is not included in the list'])
    end

    it 'returns invalid parameter error for malformed due date filter' do
      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: { due_date_from: '2026/05/12' }

      expect(response).to have_http_status(:bad_request)

      body = JSON.parse(response.body)
      expect(body['error']['details']).to include('due_date_from' => ['must be a valid date in YYYY-MM-DD format'])
    end

    it 'uses the Redis-backed campaign summary cache' do
      create(:campaign_action_item, campaign:, status: :todo)
      summary_cache = instance_double(CampaignActionItems::SummaryCache, fetch: {
        total_count: 10,
        todo_count: 4,
        doing_count: 3,
        done_count: 3,
        overdue_count: 2
      })

      allow(CampaignActionItems::SummaryCache).to receive(:new).with(campaign:).and_return(summary_cache)

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['summary']).to eq(
        'total_count' => 10,
        'todo_count' => 4,
        'doing_count' => 3,
        'done_count' => 3,
        'overdue_count' => 2
      )
    end
  end

  describe 'POST /match/api/v2/admin/campaigns/:campaign_id/action_items' do
    it 'creates an action item for the campaign' do
      summary_cache = instance_double(CampaignActionItems::SummaryCache, invalidate: true)
      search_index = instance_double(CampaignActionItems::SearchIndex, index: true)
      allow(CampaignActionItems::SummaryCache).to receive(:new).with(campaign:).and_return(summary_cache)
      allow(CampaignActionItems::SearchIndex).to receive(:new).and_return(search_index)

      params = {
        campaign_action_item: {
          title: 'Confirm creator shortlist',
          memo: 'Review candidate list before client meeting.',
          status: 'todo',
          due_date: '2026-05-15'
        }
      }

      expect do
        post "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params:
      end.to change(CampaignActionItem, :count).by(1)

      expect(response).to have_http_status(:created)

      body = JSON.parse(response.body)
      action_item = CampaignActionItem.last
      expect(body['campaign_action_item']).to include(
        'id' => action_item.id,
        'campaign_id' => campaign.id,
        'title' => 'Confirm creator shortlist',
        'status' => 'todo',
        'created_by_admin_id' => admin.id
      )
      expect(summary_cache).to have_received(:invalidate)
      expect(CampaignActionItems::SearchIndex).to have_received(:new).with(action_item: action_item)
      expect(search_index).to have_received(:index)
    end

    it 'creates an action item even when OpenSearch indexing fails' do
      search_index = instance_double(CampaignActionItems::SearchIndex, index: nil)
      allow(CampaignActionItems::SearchIndex).to receive(:new).and_return(search_index)
      allow(search_index).to receive(:index).and_raise(StandardError, 'search unavailable')

      expect do
        post "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: {
          campaign_action_item: {
            title: 'Create without search index',
            status: 'todo'
          }
        }
      end.to change(CampaignActionItem, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['campaign_action_item']).to include('title' => 'Create without search index')
    end

    it 'returns validation errors' do
      post "/match/api/v2/admin/campaigns/#{campaign.id}/action_items", params: {
        campaign_action_item: {
          title: '',
          status: 'todo'
        }
      }

      expect(response).to have_http_status(:unprocessable_entity)

      body = JSON.parse(response.body)
      expect(body['error']).to include(
        'code' => 'validation_error',
        'message' => 'Validation failed.'
      )
      expect(body['error']['details']['title']).to include("can't be blank")
    end
  end

  describe 'PATCH /match/api/v2/admin/campaigns/:campaign_id/action_items/:id' do
    it 'updates an action item for the campaign' do
      action_item = create(:campaign_action_item, campaign:, status: :todo)
      summary_cache = instance_double(CampaignActionItems::SummaryCache, invalidate: true)
      search_index = instance_double(CampaignActionItems::SearchIndex, update: true)
      allow(CampaignActionItems::SummaryCache).to receive(:new).with(campaign:).and_return(summary_cache)
      allow(CampaignActionItems::SearchIndex).to receive(:new).with(action_item:).and_return(search_index)

      patch "/match/api/v2/admin/campaigns/#{campaign.id}/action_items/#{action_item.id}", params: {
        campaign_action_item: {
          title: 'Confirm final creator shortlist',
          memo: 'Client feedback received.',
          status: 'doing',
          due_date: '2026-05-16'
        }
      }

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body['campaign_action_item']).to include(
        'id' => action_item.id,
        'title' => 'Confirm final creator shortlist',
        'memo' => 'Client feedback received.',
        'status' => 'doing',
        'due_date' => '2026-05-16'
      )
      expect(summary_cache).to have_received(:invalidate)
      expect(search_index).to have_received(:update)
    end

    it 'updates an action item even when OpenSearch update fails' do
      action_item = create(:campaign_action_item, campaign:, status: :todo, title: 'Before update')
      search_index = instance_double(CampaignActionItems::SearchIndex, update: nil)
      allow(CampaignActionItems::SearchIndex).to receive(:new).with(action_item:).and_return(search_index)
      allow(search_index).to receive(:update).and_raise(StandardError, 'search unavailable')

      patch "/match/api/v2/admin/campaigns/#{campaign.id}/action_items/#{action_item.id}", params: {
        campaign_action_item: {
          title: 'Updated without search index'
        }
      }

      expect(response).to have_http_status(:ok)
      expect(action_item.reload.title).to eq('Updated without search index')
    end
  end

  describe 'DELETE /match/api/v2/admin/campaigns/:campaign_id/action_items/:id' do
    it 'deletes an action item for the campaign' do
      action_item = create(:campaign_action_item, campaign:)
      summary_cache = instance_double(CampaignActionItems::SummaryCache, invalidate: true)
      search_index = instance_double(CampaignActionItems::SearchIndex, delete: true)
      allow(CampaignActionItems::SummaryCache).to receive(:new).with(campaign:).and_return(summary_cache)
      allow(CampaignActionItems::SearchIndex).to receive(:new).with(action_item:).and_return(search_index)

      expect do
        delete "/match/api/v2/admin/campaigns/#{campaign.id}/action_items/#{action_item.id}"
      end.to change(CampaignActionItem, :count).by(-1)

      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_blank
      expect(summary_cache).to have_received(:invalidate)
      expect(search_index).to have_received(:delete)
    end

    it 'deletes an action item even when OpenSearch delete fails' do
      action_item = create(:campaign_action_item, campaign:)
      search_index = instance_double(CampaignActionItems::SearchIndex, delete: nil)
      allow(CampaignActionItems::SearchIndex).to receive(:new).with(action_item:).and_return(search_index)
      allow(search_index).to receive(:delete).and_raise(StandardError, 'search unavailable')

      expect do
        delete "/match/api/v2/admin/campaigns/#{campaign.id}/action_items/#{action_item.id}"
      end.to change(CampaignActionItem, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe 'authentication' do
    it 'requires an authenticated admin' do
      sign_out admin

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"

      expect(response).to have_http_status(:unauthorized)

      body = JSON.parse(response.body)
      expect(body['error']).to include(
        'code' => 'admin_authorization_error',
        'message' => 'Admin authentication is required.'
      )
    end
  end

  describe 'not found' do
    it 'returns not found when campaign does not exist' do
      get '/match/api/v2/admin/campaigns/999999/action_items'

      expect(response).to have_http_status(:not_found)

      body = JSON.parse(response.body)
      expect(body['error']).to include(
        'code' => 'not_found',
        'message' => 'Resource was not found.'
      )
    end

    it 'returns not found when action item does not belong to campaign' do
      other_action_item = create(:campaign_action_item)

      patch "/match/api/v2/admin/campaigns/#{campaign.id}/action_items/#{other_action_item.id}", params: {
        campaign_action_item: {
          title: 'Should not update'
        }
      }

      expect(response).to have_http_status(:not_found)

      body = JSON.parse(response.body)
      expect(body['error']).to include(
        'code' => 'not_found',
        'message' => 'Resource was not found.'
      )
    end
  end
end
