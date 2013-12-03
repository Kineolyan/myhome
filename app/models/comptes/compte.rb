class Comptes::Compte < ActiveRecord::Base
  attr_readonly :solde
  has_many :transactions

  validates :nom, presence: true, uniqueness: true
  validates :solde, presence: true, numericality: { only_integer: true }
end
