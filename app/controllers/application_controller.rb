class ApplicationController < ActionController::Base
  private

  def after_sign_in_path_for(_resource)
    '/?api=1&campaignId=1'
  end
end
