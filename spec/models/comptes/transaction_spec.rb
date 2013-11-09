require 'spec_helper'

describe Comptes::Transaction do

  before(:all) do
    @compte = Comptes::Compte.new(nom: 'Super compte', solde: 100)
  end

  def create_transaction(note = "C'est pas important")
    transaction = Comptes::Transaction.new(titre: 'Cadeau', somme: 1500, jour: Date.new(2014, 1, 1), compte: @compte)
    transaction.notes = note unless note.empty?
    transaction
  end

  def make_transaction(montant)
    transaction = Comptes::Transaction.new(titre: 'Cadeau', somme: montant, jour: Date.new(2014, 1, 1), compte: @compte)
  end

  it 'creates with correct parameters' do
    transaction = create_transaction
    expect(transaction).to be_valid
  end

  it 'is valid without a note' do
    transaction = create_transaction ''
    expect(transaction).to be_valid
  end

  it "n'est pas valide sans titre" do
    transaction = Comptes::Transaction.new(somme: 1500, jour: Date.new(2014, 1, 1), compte: @compte)
    expect(transaction).not_to be_valid
  end

  it "n'est pas valide sans somme" do
    transaction = Comptes::Transaction.new(titre: 'Cadeau', jour: Date.new(2014, 1, 1), compte: @compte)
    expect(transaction).not_to be_valid
  end

  it "n'est pas valide avec une somme alphabétique" do
    transaction = create_transaction
    transaction.somme = 'abcde'
    expect(transaction).not_to be_valid
  end

  it "n'est pas valide sans date" do
    transaction = Comptes::Transaction.new(titre: 'Cadeau', somme: 1500, compte: @compte)
    expect(transaction).not_to be_valid
  end

  it "n'est pas valide sans compte" do
    transaction = Comptes::Transaction.new(titre: 'Cadeau', somme: 1500, jour: Date.new(2014, 1, 1))
    expect(transaction).not_to be_valid
  end

  it "fait varier le solde du compte" do
    montant = 1200
    expect {
      make_transaction(montant).save
    }.to change { @compte.solde }.by(montant)

    montant = -180
    expect {
      make_transaction(montant).save
    }.to change { @compte.solde }.by(montant)
  end

  it "ne touche pas le solde du compte sans save" do
    montant = 100
    previous_solde = @compte.solde
    new_solde = previous_solde + montant

    expect {
      make_transaction(montant)
    }.not_to change { @compte.solde }.from(previous_solde).to(new_solde)
  end

end