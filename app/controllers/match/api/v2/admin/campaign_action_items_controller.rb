module Match
  module Api
    module V2
      module Admin
        class CampaignActionItemsController < BaseController
          before_action :set_campaign
          before_action :set_campaign_action_item, only: [:update, :destroy]

          def index
            action_items = CampaignActionItems::IndexQuery.new(campaign: @campaign, params: index_params).call
            action_items = action_items.preload(:created_by_admin)
            paginated_action_items = action_items.page(page_param).per(per_page_param)

            render json: {
              campaign_action_items: paginated_action_items.map { |action_item| serialize(action_item) },
              summary: summary_cache.fetch,
              pagination: pagination_payload(paginated_action_items)
            }
          rescue CampaignActionItems::IndexQuery::InvalidParameter => error
            render_invalid_parameter_error(error)
          end

          def create
            action_item = @campaign.campaign_action_items.build(campaign_action_item_params)
            action_item.created_by_admin = current_admin

            if action_item.save
              summary_cache.invalidate
              sync_search_index(action_item, :index)
              render json: { campaign_action_item: serialize(action_item) }, status: :created
            else
              render_validation_error(action_item)
            end
          end

          def update
            if @campaign_action_item.update(campaign_action_item_params)
              summary_cache.invalidate
              sync_search_index(@campaign_action_item, :update)
              render json: { campaign_action_item: serialize(@campaign_action_item) }
            else
              render_validation_error(@campaign_action_item)
            end
          end

          def destroy
            @campaign_action_item.destroy!
            summary_cache.invalidate
            sync_search_index(@campaign_action_item, :delete)
            head :no_content
          end

          private

          def set_campaign
            @campaign = Campaign.find(params[:campaign_id])
          end

          def set_campaign_action_item
            @campaign_action_item = @campaign.campaign_action_items.find(params[:id])
          end

          def campaign_action_item_params
            params.require(:campaign_action_item).permit(:title, :memo, :status, :due_date)
          end

          def index_params
            params.permit(:q, :status, :due_date_from, :due_date_to)
          end

          def serialize(action_item)
            CampaignActionItemSerializer.new(action_item).as_json
          end

          def page_param
            page = params[:page].to_i
            page.positive? ? page : 1
          end

          def per_page_param
            per_page = params[:per_page].to_i
            return 20 unless per_page.positive?

            [per_page, 100].min
          end

          def summary_cache
            @summary_cache ||= CampaignActionItems::SummaryCache.new(campaign: @campaign)
          end

          def search_index(action_item)
            CampaignActionItems::SearchIndex.new(action_item:)
          end

          def sync_search_index(action_item, operation)
            search_index(action_item).public_send(operation)
          rescue StandardError => error
            Rails.logger.warn("Campaign action item search index sync failed: #{operation}: #{error.class}: #{error.message}")
          end

          def pagination_payload(paginated_scope)
            {
              count: paginated_scope.size,
              current_page: paginated_scope.current_page,
              total_pages: paginated_scope.total_pages,
              total_count: paginated_scope.total_count,
              per_page: paginated_scope.limit_value
            }
          end

          def render_validation_error(record)
            render json: {
              error: {
                code: 'validation_error',
                message: 'Validation failed.',
                details: record.errors.to_hash
              }
            }, status: :unprocessable_entity
          end

          def render_invalid_parameter_error(error)
            render json: {
              error: {
                code: 'invalid_parameter',
                message: 'Invalid request parameter.',
                details: error.details
              }
            }, status: :bad_request
          end
        end
      end
    end
  end
end
