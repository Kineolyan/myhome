class Comptes::Transaction < ActiveRecord::Base
  belongs_to :compte, validate: true

  validates :titre, presence: true
  validates :somme, presence: true, numericality: { only_integer: true }
  validates :jour, presence: true
  validates :compte, presence: true

  after_save :make_transaction

  private
  def make_transaction
    compte.solde += somme
    # save or not the compte ?
  end
end
