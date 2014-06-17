require "enum_class"

class Comptes::Transaction < ActiveRecord::Base
  TypePaiement = EnumClass.new comptant: 0

  belongs_to :compte, validate: true

  validates :titre, presence: true
  validates :somme, presence: true, numericality: { only_integer: true }
  validates :jour, presence: true
  validates :compte, presence: true
  validates :type_paiement, presence: true
  validate :type_paiement_is_valid?

  after_save :make_transaction
  before_destroy :undo_transaction

  private
  def type_paiement_is_valid?
    errors.add(:type_paiement, "n'est pas un type valide") unless TypePaiement.is_valid? type_paiement
  end

  def make_transaction
    unless compte.save
      logger.error "Failed to update account #{@compte} solde."
    end
  end

  def undo_transaction
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

  def paiement
    TypePaiement.value_of(type_paiement).name
  end
end
