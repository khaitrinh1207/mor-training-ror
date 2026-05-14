FactoryBot.define do
  factory :campaign_action_item_audit_log do
    association :campaign_action_item
    association :created_by_admin, factory: :admin
    event { 'created' }
    title { campaign_action_item.title }
    status { campaign_action_item.status }
  end
end
