require 'spec_helper'

describe Comptes::Transaction do

  before(:each) do
    DatabaseCleaner.clean

    @compte = Comptes::Compte.new(nom: 'Super compte', solde_historique: 100)
    expect(@compte.save).to be true

    @transaction_attributes = { titre: 'Cadeau', somme: 1500, jour: Date.new(2014, 1, 1), compte: @compte, type_paiement: Comptes::Transaction::TypePaiement.COMPTANT }
  end

  def create_transaction(values = { notes: "C'est pas important" })
    @transaction_attributes.merge! values

    Comptes::Transaction.new @transaction_attributes
  end

  def make_transaction(values = {})
    transaction = create_transaction(values)

    return transaction, transaction.save
  end

  context "Validation à la création" do

    it 'creates with correct parameters' do
      transaction = create_transaction

      expect(transaction).to be_valid
    end

    it 'is valid without a note' do
      transaction = create_transaction notes: ''

      expect(transaction).to be_valid
    end

    it "n'est pas valide sans titre" do
      @transaction_attributes.delete :titre
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans somme" do
      @transaction_attributes.delete :somme
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide avec une somme alphabétique" do
      transaction = create_transaction somme: 'abcde'

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans date" do
      @transaction_attributes.delete :jour
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans compte" do
      @transaction_attributes.delete :compte
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans type", todo: true do
      @transaction_attributes.delete :type_paiement
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide avec un type erronné", todo: true do
      @transaction_attributes[:type_paiement] = -1
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

  end

  context "Operations a la création" do

    it "fait varier le solde du compte" do
      montant = 1200
      expect {
        make_transaction(somme: montant)
      }.to change { @compte.solde }.by(montant)

      montant = -180
      expect {
        make_transaction(somme: montant)
      }.to change { @compte.solde }.by(montant)
    end

    it "enregistre les changements de solde" do
      make_transaction(somme: 1200)

      expect(Comptes::Compte.find(@compte.id).solde).to eq(@compte.solde)
    end

    it "ne touche pas le solde du compte sans save" do
      montant = 100
      transaction = nil

      expect {
        transaction = create_transaction(somme: montant)
      }.not_to change { @compte.solde }

      expect {
        transaction.save
      }.to change { @compte.solde }.by montant
    end

  end

  context "Operations à la suppression" do

    it "recrédite le compte après une suppression" do
      montant = -1200

      transaction, success = make_transaction somme: montant
      expect(transaction).not_to be_nil

      expect {
        transaction.destroy
      }.to change{ Comptes::Compte.find(@compte.id).solde }.by(-montant)
    end

  end

end