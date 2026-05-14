require 'rails_helper'
require 'mock_redis'

RSpec.describe CampaignActionItems::SummaryCache do
  let(:campaign) { create(:campaign) }
  let(:redis) { MockRedis.new }
  let(:cache) { described_class.new(campaign:, redis:) }

  describe '#fetch' do
    it 'calculates summary from MySQL and writes Redis on cache miss' do
      create(:campaign_action_item, campaign:, status: :todo, due_date: Date.current - 1.day)
      create(:campaign_action_item, campaign:, status: :doing)
      create(:campaign_action_item, campaign:, status: :done, due_date: Date.current - 2.days)

      expect(cache.fetch).to eq(
        total_count: 3,
        todo_count: 1,
        doing_count: 1,
        done_count: 1,
        overdue_count: 1
      )
      expect(JSON.parse(redis.get(cache.cache_key))).to eq(
        'total_count' => 3,
        'todo_count' => 1,
        'doing_count' => 1,
        'done_count' => 1,
        'overdue_count' => 1
      )
    end

    it 'returns cached summary on cache hit' do
      redis.set(cache.cache_key, {
        total_count: 9,
        todo_count: 4,
        doing_count: 3,
        done_count: 2,
        overdue_count: 1
      }.to_json)

      expect(cache.fetch).to eq(
        total_count: 9,
        todo_count: 4,
        doing_count: 3,
        done_count: 2,
        overdue_count: 1
      )
    end

    it 'falls back to MySQL when Redis fails' do
      create(:campaign_action_item, campaign:, status: :todo)
      failing_redis = Class.new do
        def get(_key)
          raise Redis::BaseError, 'redis unavailable'
        end
      end.new

      expect(described_class.new(campaign:, redis: failing_redis).fetch).to include(
        total_count: 1,
        todo_count: 1
      )
    end
  end

  describe '#invalidate' do
    it 'deletes the cache key' do
      redis.set(cache.cache_key, { total_count: 1 }.to_json)

      cache.invalidate

      expect(redis.get(cache.cache_key)).to be_nil
    end

    it 'does not raise when Redis delete fails' do
      failing_redis = Class.new do
        def del(_key)
          raise Redis::BaseError, 'redis unavailable'
        end
      end.new

      expect { described_class.new(campaign:, redis: failing_redis).invalidate }.not_to raise_error
    end
  end
end
