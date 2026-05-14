require 'rails_helper'

RSpec.describe 'Campaign action items training HTML', type: :request do
  describe 'GET /admin/training/campaign_action_items' do
    it 'renders the training index page' do
      campaign = create(:campaign, name: 'Spring Campaign')
      create(:campaign_action_item, campaign:, title: 'Render index item', status: :todo)

      get '/admin/training/campaign_action_items'

      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Campaign Action Items Training')
      expect(response.body).to include('Render index item')
      expect(response.body).to include('Spring Campaign')
    end
  end

  describe 'GET /admin/training/campaign_action_items/:id' do
    it 'renders the training show page' do
      action_item = create(:campaign_action_item, title: 'Render detail item', memo: 'Render memo')

      get "/admin/training/campaign_action_items/#{action_item.id}"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Render detail item')
      expect(response.body).to include('Render memo')
    end
  end

  describe 'POST /admin/training/campaign_action_items' do
    it 'redirects to show and ignores unpermitted creator id' do
      campaign = create(:campaign)
      unsafe_admin = create(:admin)

      expect do
        post '/admin/training/campaign_action_items', params: {
          campaign_action_item: {
            campaign_id: campaign.id,
            title: 'Created through HTML flow',
            memo: 'Strong parameters training',
            status: 'todo',
            due_date: '2026-05-14',
            created_by_admin_id: unsafe_admin.id
          }
        }
      end.to change(CampaignActionItem, :count).by(1)

      action_item = CampaignActionItem.last
      expect(action_item.created_by_admin_id).to be_nil
      expect(response).to redirect_to("/admin/training/campaign_action_items/#{action_item.id}")

      follow_redirect!

      expect(response.body).to include('Created through HTML flow')
    end
  end
end
