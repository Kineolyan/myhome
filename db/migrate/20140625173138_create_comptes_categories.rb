class CreateComptesCategories < ActiveRecord::Migration
  def change
    create_table :comptes_categories do |t|
      t.string :nom

      t.timestamps
    end
  end
end
