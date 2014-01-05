class Comptes::Transaction < ActiveRecord::Base
  belongs_to :compte, validate: true

  validates :titre, presence: true
  validates :somme, presence: true, numericality: { only_integer: true }
  validates :jour, presence: true
  validates :compte, presence: true

  after_save :make_transaction
  before_destroy :undo_transaction

  private
  def make_transaction
    compte.solde += somme
    unless compte.save
      logger.error "Failed to update account #{@compte} solde."
    end
  end

  def undo_transaction
    logger
    compte.solde -= somme
    unless compte.save
      logger.error "Failed to undo transaction #{self}."
    end
  end

  public
  def jour_formatte
    jour.strftime("%d/%m/%Y")
  end

  def somme_formattee
    ApplicationHelper::format_amount somme
  end
end
