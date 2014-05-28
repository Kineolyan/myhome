class CreateComptesTransactions < ActiveRecord::Migration
  def change
    create_table :comptes_transactions do |t|
      t.string :titre
      t.integer :somme
      t.datetime :jour
      t.text :notes
      t.references :compte, index: true

      t.timestamps
    end
  end
end
