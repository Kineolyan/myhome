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
      total_transactions = Transaction.where(compte_id: id).sum(:somme)
      # Ne pas compter les paiements en monnaie
      total_tansactions_monnaie = TransactionMonnaie.where(compte_id: id).sum(:somme)

      ComptesHelper.decode_amount(solde_historique + (total_transactions - total_tansactions_monnaie))
    end
  end

end
