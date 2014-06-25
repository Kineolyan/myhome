class Comptes::Categorization < ActiveRecord::Base
  belongs_to :transaction
  belongs_to :categorie

  validates :transaction, presence: true
  validates :categorie, presence: true
end
