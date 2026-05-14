class CreateCampaigns < ActiveRecord::Migration[7.0]
  def change
    create_table :campaigns do |t|
      t.string :name, null: false
      t.text :description

      t.timestamps
    end

    add_index :campaigns, :name
  end
end
