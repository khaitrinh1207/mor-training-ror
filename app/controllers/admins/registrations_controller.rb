module Admins
  class RegistrationsController < Devise::RegistrationsController
    protected

    def sign_up(_resource_name, _resource)
      true
    end

    def after_sign_up_path_for(_resource)
      new_admin_session_path
    end
  end
end
