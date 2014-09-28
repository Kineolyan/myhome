module Comptes

  class Transaction < ActiveRecord::Base
    belongs_to :compte, validate: true

    has_many :categorizations, dependent: :destroy
    accepts_nested_attributes_for :categorizations
    has_many :categories, through: :categorizations

    validates :titre, presence: true
    validates :somme, presence: true, numericality: { only_integer: true }
    validates :jour, presence: true
    validates :compte, presence: true

    scope :until, ->(time) { where("jour < ?", time) }
    scope :since, ->(time) { where("jour > ?", time) }
    scope :of_account, ->(compte) { where(compte_id: compte.id) if compte }

    def self.type_name
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
