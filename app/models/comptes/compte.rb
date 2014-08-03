module Comptes

  class Compte < ActiveRecord::Base
    has_many :transactions
    attr_readonly :solde_historique

    validates :nom, presence: true, uniqueness: true
    validates :solde_historique, presence: true, numericality: { only_integer: true }

    def solde_formatte with_currency = true
      ComptesHelper::format_amount solde, with_currency
    end

    def solde options = {}
      all_transactions = transactions
      # Ne pas compter les paiements en monnaie
      tansactions_monnaie = transactions.where(type: TransactionMonnaie)

      if options.key?(:until)
        all_transactions = all_transactions.until options[:until]
        tansactions_monnaie = tansactions_monnaie.until options[:until]
      end

      solde = ComptesHelper.decode_amount(solde_historique + (all_transactions.sum(:somme) - tansactions_monnaie.sum(:somme)))
      options[:with_currency] ? ComptesHelper::format_amount(solde) : solde
    end
  end

end
