module Match
  module Api
    module V2
      module Auth
        module Admins
          class SessionsController < ApplicationController
            skip_forgery_protection only: :destroy

            def authenticate
              if admin_signed_in?
                render json: {
                  admin: {
                    id: current_admin.id,
                    email: current_admin.email,
                    csrf_token: form_authenticity_token
                  },
                  is_logged_in: true
                }
                return
              end

              render_unauthorized
            end

            def destroy
              sign_out(:admin)

              head :no_content
            end

            private

            def render_unauthorized
              render json: {
                error: {
                  code: 'admin_authorization_error',
                  message: 'Admin authentication is required.'
                }
              }, status: :unauthorized
            end
          end
        end
      end
    end
  end
end
