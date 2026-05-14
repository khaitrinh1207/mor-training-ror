class CampaignActionItemSerializer < ActiveModel::Serializer
  attributes :id,
             :campaign_id,
             :title,
             :memo,
             :status,
             :due_date,
             :created_by_admin_id,
             :created_by_admin_email,
             :created_at,
             :updated_at

  def created_by_admin_email
    @object.created_by_admin&.email
  end
end
