class CampaignActionItemAuditLog < ApplicationRecord
  belongs_to :campaign_action_item
  belongs_to :created_by_admin, class_name: 'Admin', optional: true

  validates :event, presence: true
  validates :title, presence: true
  validates :status, presence: true
end
