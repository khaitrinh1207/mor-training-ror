module CampaignActionItems
  class IndexQuery
    class InvalidParameter < StandardError
      attr_reader :details

      def initialize(parameter, message)
        @details = { parameter => [message] }
        super("#{parameter} #{message}")
      end
    end

    DATE_FORMAT = /\A\d{4}-\d{2}-\d{2}\z/.freeze

    def initialize(campaign:, params:)
      @campaign = campaign
      @params = params
    end

    def call
      scope = campaign.campaign_action_items
      scope = filter_by_keyword(scope)
      scope = filter_by_status(scope)
      scope = filter_by_due_date_from(scope)
      scope = filter_by_due_date_to(scope)
      scope.ordered_for_admin_list
    end

    private

    attr_reader :campaign, :params

    def filter_by_keyword(scope)
      keyword = params[:q].to_s.strip
      return scope if keyword.blank?

      matching_ids = KeywordSearch.new(campaign:, q: keyword).call.select(:id)
      scope.where(id: matching_ids)
    end

    def filter_by_status(scope)
      status = params[:status].to_s.strip
      return scope if status.blank?

      unless CampaignActionItem.statuses.key?(status)
        raise InvalidParameter.new(:status, 'is not included in the list')
      end

      scope.with_status(status)
    end

    def filter_by_due_date_from(scope)
      return scope if params[:due_date_from].blank?

      scope.due_on_or_after(parse_date(:due_date_from))
    end

    def filter_by_due_date_to(scope)
      return scope if params[:due_date_to].blank?

      scope.due_on_or_before(parse_date(:due_date_to))
    end

    def parse_date(parameter)
      value = params[parameter].to_s
      raise_invalid_date(parameter) unless value.match?(DATE_FORMAT)

      Date.iso8601(value)
    rescue Date::Error
      raise_invalid_date(parameter)
    end

    def raise_invalid_date(parameter)
      raise InvalidParameter.new(parameter, 'must be a valid date in YYYY-MM-DD format')
    end
  end
end
