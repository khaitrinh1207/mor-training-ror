module CampaignActionItems
  class KeywordSearch
    SEARCH_FIELDS = %w[title memo].freeze

    def initialize(campaign:, q:, client: SearchIndex.client)
      @campaign = campaign
      @q = q
      @client = client
    end

    def call
      keyword = q.to_s.strip
      return base_scope if keyword.blank?

      ids = search_ids(keyword)
      return base_scope.none if ids.empty?

      base_scope.where(id: ids).in_order_of(:id, ids)
    rescue StandardError => error
      log_search_error(error)
      fallback_scope(keyword)
    end

    private

    attr_reader :campaign, :q, :client

    def base_scope
      campaign.campaign_action_items
    end

    def search_ids(keyword)
      response = client.search(index: SearchIndex.index_name, body: search_body(keyword))
      hits = response.dig('hits', 'hits') || response.dig(:hits, :hits) || []

      hits.filter_map { |hit| hit_id(hit) }.uniq
    end

    def search_body(keyword)
      {
        query: {
          bool: {
            filter: [
              { term: { campaign_id: campaign.id } }
            ],
            must: [
              {
                multi_match: {
                  query: keyword,
                  fields: SEARCH_FIELDS
                }
              }
            ]
          }
        }
      }
    end

    def hit_id(hit)
      hit['_id'] || hit[:_id] || hit.dig('_source', 'id') || hit.dig(:_source, :id)
    end

    def fallback_scope(keyword)
      escaped_keyword = ActiveRecord::Base.sanitize_sql_like(keyword.downcase)

      base_scope.where(
        'LOWER(title) LIKE :keyword OR LOWER(memo) LIKE :keyword',
        keyword: "%#{escaped_keyword}%"
      )
    end

    def log_search_error(error)
      Rails.logger.warn("Campaign action item keyword search failed: #{error.class}: #{error.message}")
    end
  end
end
