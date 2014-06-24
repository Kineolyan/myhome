class StoreTransactionType < ActiveRecord::Migration

  def up
    change_table :comptes_transactions do |t|
      t.string :type
      t.remove :type_paiement
    end

    Comptes::Transaction.update_all type: "Comptes::Transaction"
  end

  def down
    change_table :comptes_transactions do |t|
      t.remove :type
      t.integer :type_paiement
    end

    Comptes::Transaction.update_all type_paiement: 0
  end

end
