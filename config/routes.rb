Rails.application.routes.draw do
  devise_for :admins

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
            resources :action_items, controller: 'campaign_action_items', only: [:index, :create, :update, :destroy]
          end
        end
      end
    end
  end

  scope path: 'admin/training', module: 'admin_training', as: 'admin_training' do
    resources :campaign_action_items, only: [:index, :show, :create]
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
