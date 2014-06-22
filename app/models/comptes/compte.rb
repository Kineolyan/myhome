module Comptes

  class Compte < ActiveRecord::Base
    has_many :transactions
    attr_readonly :solde_historique

    validates :nom, presence: true, uniqueness: true
    validates :solde_historique, presence: true, numericality: { only_integer: true }

    def solde_formatte with_currency = true
      ComptesHelper::format_amount solde, with_currency
    end

    def solde
      ComptesHelper.decode_amount(solde_historique + Transaction.where(compte_id: id).sum(:somme))
    end
  end

end