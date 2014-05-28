class RemoveTimeFromTransactions < ActiveRecord::Migration
  def up
    change_column :comptes_transactions, :jour, :date
  end

  def down
    change_column :comptes_transactions, :jour, :datetime
  end
end
