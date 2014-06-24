require 'spec_helper'

describe Comptes::TransactionMonnaie do

  before(:each) do
    DatabaseCleaner.clean

    @compte = Comptes::Compte.new(nom: 'Super compte', solde_historique: 1000)
    expect(@compte.save).to be true

    @transaction_attributes = { titre: 'Cadeau', somme: 1500, jour: Date.new(2014, 1, 1), compte: @compte }
  end

  def create_transaction(values = { notes: "C'est pas important" })
    @transaction_attributes.merge! values

    Comptes::TransactionMonnaie.new @transaction_attributes
  end

  def make_transaction(values = {})
    transaction = create_transaction(values)

    return transaction, transaction.save
  end

  context "a la creation de transaction" do

    it "le montant du compte ne change pas" do
      montant = 150
      expect {
        make_transaction somme: montant
      }.not_to change{ @compte.solde }
    end

  end

  context "a la suppression de la transaction" do

    it "ne change pas le montant du compte" do
      montant = 150
      transaction, transaction_creation = make_transaction somme: montant
      expect(transaction_creation).to be true

      expect {
        transaction.destroy
      }.not_to change{ @compte.solde }
    end

  end

end