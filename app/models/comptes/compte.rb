class Comptes::Compte < ActiveRecord::Base
  has_many :transactions

  validates :nom, presence: true, uniqueness: true
  validates :solde, presence: true, numericality: { only_integer: true }

  public
  def solde_formatte
    ApplicationHelper::format_amount solde
  end
end
