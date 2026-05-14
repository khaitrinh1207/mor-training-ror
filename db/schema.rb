# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2026_05_14_093000) do
  create_table "admins", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admins_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admins_on_reset_password_token", unique: true
  end

  create_table "campaign_action_item_audit_logs", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "campaign_action_item_id", null: false
    t.bigint "created_by_admin_id"
    t.string "event", null: false
    t.string "title", null: false
    t.string "status", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_action_item_id"], name: "index_action_item_audit_logs_on_action_item_id"
    t.index ["created_by_admin_id"], name: "index_campaign_action_item_audit_logs_on_created_by_admin_id"
    t.index ["event"], name: "index_campaign_action_item_audit_logs_on_event"
  end

  create_table "campaign_action_items", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "campaign_id", null: false
    t.string "title", null: false
    t.text "memo"
    t.integer "status", default: 0, null: false
    t.date "due_date"
    t.bigint "created_by_admin_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id", "status"], name: "index_campaign_action_items_on_campaign_id_and_status"
    t.index ["campaign_id"], name: "index_campaign_action_items_on_campaign_id"
    t.index ["due_date"], name: "index_campaign_action_items_on_due_date"
    t.index ["status"], name: "index_campaign_action_items_on_status"
  end

  create_table "campaigns", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_campaigns_on_name"
  end

  add_foreign_key "campaign_action_item_audit_logs", "campaign_action_items"
  add_foreign_key "campaign_action_items", "campaigns"
end
