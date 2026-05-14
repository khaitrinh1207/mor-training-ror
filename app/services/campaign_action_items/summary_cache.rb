module CampaignActionItems
  class SummaryCache
    EXPIRES_IN = 10.minutes

    def initialize(campaign:, redis: self.class.redis)
      @campaign = campaign
      @redis = redis
    end

    def self.redis
      @redis ||= Redis.new(url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/1'))
    end

    def fetch
      cached_summary || calculated_summary.tap { |summary| write(summary) }
    rescue Redis::BaseError => error
      log_cache_error(error)
      calculated_summary
    end

    def invalidate
      redis.del(cache_key)
      true
    rescue Redis::BaseError => error
      log_cache_error(error)
      false
    end

    def cache_key
      "campaign_action_items:summary:campaign:#{campaign.id}"
    end

    private

    attr_reader :campaign, :redis

    def cached_summary
      payload = redis.get(cache_key)
      return if payload.blank?

      JSON.parse(payload).symbolize_keys
    end

    def write(summary)
      redis.setex(cache_key, EXPIRES_IN.to_i, summary.to_json)
    end

    def calculated_summary
      scope = campaign.campaign_action_items

      {
        total_count: scope.count,
        todo_count: scope.where(status: CampaignActionItem.statuses[:todo]).count,
        doing_count: scope.where(status: CampaignActionItem.statuses[:doing]).count,
        done_count: scope.where(status: CampaignActionItem.statuses[:done]).count,
        overdue_count: scope.where('due_date < ?', Date.current).where.not(status: CampaignActionItem.statuses[:done]).count
      }
    end

    def log_cache_error(error)
      Rails.logger.warn("Campaign action item summary cache failed: #{error.class}: #{error.message}")
    end
  end
end
