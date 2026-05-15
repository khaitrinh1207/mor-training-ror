require 'rails_helper'

RSpec.describe 'admin registration routes', type: :routing do
  it 'exposes local training admin registration routes' do
    expect(get: '/admins/sign_up').to be_routable
    expect(post: '/admins').to be_routable
  end
end
