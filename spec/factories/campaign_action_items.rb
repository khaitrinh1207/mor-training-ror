FactoryBot.define do
  factory :campaign_action_item do
    association :campaign
    association :created_by_admin, factory: :admin
    sequence(:title) { |n| "Action Item #{n}" }
    memo { "Follow up with campaign owner" }
    status { :todo }
    due_date { Date.current + 7.days }
  end
end
