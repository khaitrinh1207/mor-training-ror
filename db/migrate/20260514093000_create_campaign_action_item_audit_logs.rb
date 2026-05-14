class CreateCampaignActionItemAuditLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :campaign_action_item_audit_logs do |t|
      t.references :campaign_action_item, null: false, foreign_key: true, index: { name: 'index_action_item_audit_logs_on_action_item_id' }
      t.bigint :created_by_admin_id
      t.string :event, null: false
      t.string :title, null: false
      t.string :status, null: false

      t.timestamps
    end

    add_index :campaign_action_item_audit_logs, :event
    add_index :campaign_action_item_audit_logs, :created_by_admin_id
  end
end
