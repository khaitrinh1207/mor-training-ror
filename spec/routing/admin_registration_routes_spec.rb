require 'rails_helper'

RSpec.describe 'admin registration routes', type: :routing do
  it 'exposes local training admin registration routes' do
    expect(get: '/admins/sign_up').to be_routable
    expect(post: '/admins').to be_routable
  end

  it 'does not expose unused admin account management routes' do
    expect(get: '/admins/password/new').not_to be_routable
    expect(get: '/admins/edit').not_to be_routable
    expect(get: '/admins/cancel').not_to be_routable
    expect(delete: '/admins').not_to be_routable
  end

  it 'does not expose the unused PUT update route for action items' do
    expect(put: '/match/api/v2/admin/campaigns/1/action_items/1').not_to be_routable
  end
end
