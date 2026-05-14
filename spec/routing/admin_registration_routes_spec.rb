require 'rails_helper'

RSpec.describe 'admin registration routes', type: :routing do
  it 'does not expose public admin registration routes' do
    expect(get: '/admins/sign_up').not_to be_routable
    expect(post: '/admins').not_to be_routable
  end
end
