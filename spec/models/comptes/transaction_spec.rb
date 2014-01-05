require 'spec_helper'

describe Comptes::Transaction do

  before(:each) do
    DatabaseCleaner.clean

    @compte = Comptes::Compte.new(nom: 'Super compte', solde: 100)
    expect(@compte.save).to be_true

    @transaction_attributes = { titre: 'Cadeau', somme: 1500, jour: Date.new(2014, 1, 1), compte: @compte }
  end

  def create_transaction(values = { notes: "C'est pas important" })
    @transaction_attributes.merge! values

    Comptes::Transaction.new @transaction_attributes
  end

  def make_transaction(values = {})
    transaction = create_transaction(values)

    return transaction, transaction.save
  end

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
    previous_solde = @compte.solde
    new_solde = previous_solde + montant

    expect {
      create_transaction(somme: montant)
    }.not_to change { @compte.solde }.from(previous_solde).to(new_solde)
  end

  it "recrédite le compte après une suppression" do
    montant = -1200

    transaction, success = make_transaction somme: montant
    expect(transaction).not_to be_nil

    expect {
      expect(transaction.destroy).to be_true
    }.to change{ Comptes::Compte.find(@compte.id).solde }.by(-montant)
  end

end