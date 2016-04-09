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

    scope :after, ->(time) { where("jour > ?", time.to_date) }
    scope :since, ->(time) { where("jour >= ?", time.to_date) }
    scope :until, ->(time) { where("jour <= ?", time.to_date) }
    scope :before, ->(time) { where("jour < ?", time.to_date) }
    scope :of_account, ->(compte) { where(compte_id: compte.id) if compte }
    scope :expenses, -> { where("somme < 0") }
    scope :revenues, -> { where("somme > 0") }

    def self.type_name
      "Défaut"
    end

    def jour_formatte
      jour.strftime("%d/%m/%Y")
    end

    def somme_formattee with_currency = true
      ComptesHelper::format_amount ComptesHelper.decode_amount(somme), with_currency
    end

    def self.to_csv options = {}
      CSV.generate(options) do |csv|
        csv << %w{ID Titre Montant Date Compte Categorie}
        all.each do |transaction|
          csv << [
            transaction.id,
            transaction.titre,
            transaction.somme,
            transaction.jour_formatte,
            transaction.compte.nom,
            transaction.categories.empty? ? '' : transaction.categories.first.nom
          ]
        end
      end
    end
  end

end
