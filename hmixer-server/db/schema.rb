# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130213192911) do

  create_table "age_ranges", :force => true do |t|
    t.string   "name"
    t.integer  "age_min"
    t.integer  "age_max"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "contributions", :force => true do |t|
    t.integer  "submission_id"
    t.integer  "metric_id"
    t.decimal  "healthy_min",    :precision => 10, :scale => 0
    t.decimal  "healthy_max",    :precision => 10, :scale => 0
    t.decimal  "total_min",      :precision => 10, :scale => 0
    t.decimal  "total_max",      :precision => 10, :scale => 0
    t.integer  "score_weight"
    t.datetime "created_at",                                    :null => false
    t.datetime "updated_at",                                    :null => false
    t.integer  "demographic_id"
  end

  add_index "contributions", ["metric_id"], :name => "index_contributions_on_metric_id"
  add_index "contributions", ["submission_id"], :name => "index_contributions_on_submission_id"

  create_table "demographics", :force => true do |t|
    t.string   "gender"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.integer  "age_ranges_id"
  end

  create_table "metrics", :force => true do |t|
    t.string   "name"
    t.string   "unit"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "submissions", :force => true do |t|
    t.integer  "user_id"
    t.text     "message"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "submissions", ["user_id"], :name => "index_submissions_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "full_name"
    t.string   "email"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
