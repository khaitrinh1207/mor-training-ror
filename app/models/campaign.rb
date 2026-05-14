class Campaign < ApplicationRecord
  has_many :campaign_action_items, dependent: :destroy

  validates :name, presence: true
end
