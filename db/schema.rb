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
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140105135000) do

  create_table "comptes_comptes", force: true do |t|
    t.string   "nom"
    t.integer  "solde"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "comptes_transactions", force: true do |t|
    t.string   "titre"
    t.integer  "somme"
    t.date     "jour"
    t.text     "notes"
    t.integer  "compte_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "type_paiement"
  end

  add_index "comptes_transactions", ["compte_id"], name: "index_comptes_transactions_on_compte_id"

end
