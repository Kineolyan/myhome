class AddValidationToCompte < ActiveRecord::Migration
  def change
    add_column :comptes_comptes, :validation_date, :datetime
    add_column :comptes_comptes, :validation_solde, :integer
  end
end
