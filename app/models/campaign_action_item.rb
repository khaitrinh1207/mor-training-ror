class CampaignActionItem < ApplicationRecord
  include CampaignActionItems::Filterable

  belongs_to :campaign
  belongs_to :created_by_admin, class_name: "Admin", optional: true
  has_many :audit_logs, class_name: 'CampaignActionItemAuditLog', dependent: :destroy

  enum status: { todo: 0, doing: 1, done: 2 }, _prefix: true

  validates :campaign, presence: true
  validates :title, presence: true
  validates :status, presence: true

  after_commit :record_created_audit_log, on: :create
  after_commit :record_updated_audit_log, on: :update

  private

  def record_created_audit_log
    record_audit_log('created')
  end

  def record_updated_audit_log
    record_audit_log('updated')
  end

  def record_audit_log(event)
    audit_logs.create!(
      created_by_admin:,
      event:,
      title:,
      status:
    )
  end
end
