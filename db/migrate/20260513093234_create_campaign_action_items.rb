class CreateCampaignActionItems < ActiveRecord::Migration[7.0]
  def change
    create_table :campaign_action_items do |t|
      t.references :campaign, null: false, foreign_key: true
      t.string :title, null: false
      t.text :memo
      t.integer :status, null: false, default: 0
      t.date :due_date
      t.bigint :created_by_admin_id

      t.timestamps
    end

    add_index :campaign_action_items, :status
    add_index :campaign_action_items, :due_date
    add_index :campaign_action_items, [:campaign_id, :status]
  end
end
