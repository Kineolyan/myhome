module Comptes

  class Transaction < ActiveRecord::Base
    belongs_to :compte, validate: true

    validates :titre, presence: true
    validates :somme, presence: true, numericality: { only_integer: true }
    validates :jour, presence: true
    validates :compte, presence: true

    def type_name
      "Défaut"
    end

    def jour_formatte
      jour.strftime("%d/%m/%Y")
    end

    def somme_formattee with_currency = true
      ComptesHelper::format_amount ComptesHelper.decode_amount(somme), with_currency
    end
  end

end
