module CampaignActionItems
  class SearchIndex
    INDEX_PREFIX = 'campaign_action_items'

    def initialize(action_item:, client: self.class.client)
      @action_item = action_item
      @client = client
    end

    def self.client
      Elasticsearch::Client.new(url: ENV.fetch('OPENSEARCH_URL', 'http://localhost:9200'))
    end

    def self.index_name
      "#{INDEX_PREFIX}-#{Rails.env}"
    end

    def index
      client.index(index: self.class.index_name, id: action_item.id, body: document)
    end

    def update
      client.update(index: self.class.index_name, id: action_item.id, body: { doc: document })
    end

    def delete
      client.delete(index: self.class.index_name, id: action_item.id)
    end

    private

    attr_reader :action_item, :client

    def document
      {
        id: action_item.id,
        campaign_id: action_item.campaign_id,
        title: action_item.title,
        memo: action_item.memo,
        status: action_item.status,
        due_date: action_item.due_date&.iso8601,
        created_by_admin_id: action_item.created_by_admin_id,
        created_at: action_item.created_at&.iso8601,
        updated_at: action_item.updated_at&.iso8601
      }
    end
  end
end
