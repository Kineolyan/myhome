class CreateComptesComptes < ActiveRecord::Migration
  def change
    create_table :comptes_comptes do |t|
      t.string :nom
      t.integer :solde

      t.timestamps
    end
  end
end
