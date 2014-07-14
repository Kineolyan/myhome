class CreateComptesCategorizations < ActiveRecord::Migration
  def change
    create_table :comptes_categorizations do |t|
      t.references :transaction, index: true
      t.references :category, index: true

      t.timestamps
    end
  end
end
