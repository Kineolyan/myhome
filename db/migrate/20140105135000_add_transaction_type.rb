class AddTransactionType < ActiveRecord::Migration

  def change
    change_table :comptes_transactions do |t|
      t.integer :type_paiement
    end

    say "Updating all present transactions"
    Comptes::Transaction.update_all "type_paiement = 0"
  end

end