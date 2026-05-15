require 'rails_helper'

RSpec.describe 'Admin authentication', type: :request do
  describe 'GET /admins/sign_in' do
    it 'renders a simple demo login page' do
      get '/admins/sign_in'

      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Login')
      expect(response.body).not_to include('BitStar')
      expect(response.body).not_to include('Training flow')
    end
  end

  describe 'GET /admins/sign_up' do
    it 'renders the local training signup page' do
      get '/admins/sign_up'

      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Sign up')
      expect(response.body).not_to include('BitStar')
      expect(response.body).not_to include('Safe training account')
    end
  end

  describe 'POST /admins' do
    it 'creates an admin and starts a Devise session' do
      campaign = create(:campaign)

      expect do
        post '/admins', params: {
          admin: {
            email: 'new.admin@example.com',
            password: 'password123',
            password_confirmation: 'password123'
          }
        }
      end.to change(Admin, :count).by(1)

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /admins/sign_in' do
    it 'logs in an existing admin' do
      admin = create(:admin, email: 'login.admin@example.com', password: 'password123')
      campaign = create(:campaign)

      post '/admins/sign_in', params: {
        admin: {
          email: admin.email,
          password: 'password123'
        }
      }

      expect(response).to have_http_status(:redirect)

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE /admins/sign_out' do
    it 'logs out the current admin' do
      admin = create(:admin)
      campaign = create(:campaign)
      sign_in admin

      delete '/admins/sign_out'

      expect(response).to have_http_status(:redirect)

      get "/match/api/v2/admin/campaigns/#{campaign.id}/action_items"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /match/api/v2/auth/admins/authenticate' do
    it 'returns the current admin session' do
      admin = create(:admin, email: 'current.admin@example.com')
      sign_in admin

      get '/match/api/v2/auth/admins/authenticate'

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to match(
        'admin' => {
          'id' => admin.id,
          'email' => 'current.admin@example.com',
          'csrf_token' => kind_of(String)
        },
        'is_logged_in' => true
      )
    end

    it 'returns unauthorized for guests' do
      get '/match/api/v2/auth/admins/authenticate'

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)['error']).to include(
        'code' => 'admin_authorization_error',
        'message' => 'Admin authentication is required.'
      )
    end
  end

  describe 'DELETE /match/api/v2/auth/admins/sign_out' do
    it 'logs out the current admin for the React UI' do
      admin = create(:admin)
      sign_in admin

      delete '/match/api/v2/auth/admins/sign_out'

      expect(response).to have_http_status(:no_content)

      get '/match/api/v2/auth/admins/authenticate'

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
