Rails.application.routes.draw do
  devise_for :admins, skip: [:registrations, :passwords]

  devise_scope :admin do
    get 'admins/sign_up', to: 'admins/registrations#new', as: :new_admin_registration
    post 'admins', to: 'admins/registrations#create', as: :admin_registration
  end

  namespace :match do
    namespace :api do
      namespace :v2 do
        namespace :auth do
          namespace :admins do
            get :authenticate, to: 'sessions#authenticate'
            delete :sign_out, to: 'sessions#destroy'
          end
        end

        namespace :admin do
          resources :campaigns, only: [] do
            get 'action_items', to: 'campaign_action_items#index'
            post 'action_items', to: 'campaign_action_items#create'
            patch 'action_items/:id', to: 'campaign_action_items#update'
            delete 'action_items/:id', to: 'campaign_action_items#destroy'
          end
        end
      end
    end
  end

  scope path: 'admin/training', module: 'admin_training', as: 'admin_training' do
    resources :campaign_action_items, only: [:index, :show, :create]
  end
end
