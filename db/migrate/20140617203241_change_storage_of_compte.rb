class ChangeStorageOfCompte < ActiveRecord::Migration
  def change
    change_table :comptes_comptes do |t|
      t.rename :solde, :solde_historique
    end
  end
end
