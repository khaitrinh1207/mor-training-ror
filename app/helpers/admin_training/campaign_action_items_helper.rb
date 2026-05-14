module AdminTraining
  module CampaignActionItemsHelper
    def status_badge_label(action_item)
      action_item.status.to_s.upcase
    end

    def action_item_due_date_label(action_item)
      return 'No due date' if action_item.due_date.blank?

      action_item.due_date.iso8601
    end
  end
end
