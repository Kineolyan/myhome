class Comptes::Categorie < ActiveRecord::Base
  has_many :categorizations
  has_many :transactions, through: :categorizations, autosave: true, dependent: :destroy

  validates :nom, presence: true, uniqueness: true
end
