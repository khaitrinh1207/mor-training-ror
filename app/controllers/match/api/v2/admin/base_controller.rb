module Match
  module Api
    module V2
      module Admin
        class BaseController < ApplicationController
          before_action :authenticate_admin_session!
          rescue_from ActiveRecord::RecordNotFound, with: :render_not_found_error

          private

          def authenticate_admin_session!
            return if admin_signed_in?

            render json: {
              error: {
                code: 'admin_authorization_error',
                message: 'Admin authentication is required.'
              }
            }, status: :unauthorized
          end

          def render_not_found_error
            render json: {
              error: {
                code: 'not_found',
                message: 'Resource was not found.'
              }
            }, status: :not_found
          end
        end
      end
    end
  end
end
