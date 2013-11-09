class Comptes::Compte < ActiveRecord::Base
  validates :nom, presence: true, uniqueness: true
  validates :solde, presence: true, numericality: { only_integer: true }
end
