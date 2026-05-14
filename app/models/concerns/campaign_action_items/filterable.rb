module CampaignActionItems
  module Filterable
    extend ActiveSupport::Concern

    included do
      scope :with_status, ->(status) { where(status: CampaignActionItem.statuses.fetch(status)) }
      scope :due_on_or_after, ->(date) { where('due_date >= ?', date) }
      scope :due_on_or_before, ->(date) { where('due_date <= ?', date) }
      scope :ordered_for_admin_list, -> { order(due_date: :asc, created_at: :desc) }
    end
  end
end
