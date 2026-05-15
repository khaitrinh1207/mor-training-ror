module AdminTraining
  class CampaignActionItemsController < ApplicationController
    before_action :authenticate_admin!

    def index
      load_index_state
      @action_item = CampaignActionItem.new(status: :todo)
    end

    def show
      @action_item = CampaignActionItem.preload(:campaign, :created_by_admin).find(params[:id])
    end

    def create
      @action_item = CampaignActionItem.new(campaign_action_item_params)
      @action_item.created_by_admin = current_admin

      if @action_item.save
        redirect_to "/admin/training/campaign_action_items/#{@action_item.id}", notice: 'Campaign action item was created.'
      else
        load_index_state
        render :index, status: :unprocessable_entity
      end
    end

    private

    def campaign_action_item_params
      params.require(:campaign_action_item).permit(:campaign_id, :title, :memo, :status, :due_date)
    end

    def load_index_state
      @campaigns = Campaign.order(:name)
      @action_items = CampaignActionItem.preload(:campaign).ordered_for_admin_list
    end
  end
end
