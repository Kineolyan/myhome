require 'spec_helper'

describe Comptes::Compte do

  before(:each) do
    DatabaseCleaner.clean
    @compte = Comptes::Compte.create nom: "Compte de test", solde: 1370
  end

  def creer_compte
    Comptes::Compte.new nom: "Compte de chouchou", solde: 100
  end

  it "peut être créé" do
    compte = creer_compte
    expect(compte).to be_valid
  end

  it "ne peut pas être créé sans nom" do
    compte = Comptes::Compte.new solde: 100
    expect(compte).not_to be_valid
  end

  it "ne peut pas être créé sans solde" do
    compte = Comptes::Compte.new nom: "Compte de chouchou"
    expect(compte).not_to be_valid
  end

  it "ne peut pas être créé avec un solde alphabétique" do
    compte = Comptes::Compte.new nom: "Mon compte", solde: "abcde"
    expect(compte).not_to be_valid
  end

  it "ne peut pas créer un compte avec un nom existant" do
    compte = creer_compte
    expect(compte).to be_valid
    expect(compte.save).to be true

    compte_deux = creer_compte
    expect(compte_deux).not_to be_valid
  end

  it "peut changer de nom" do
    @compte.nom = "Nouveau mom du compte"
    expect(@compte.save).to be true

    database_compte = Comptes::Compte.find(@compte.id)
    expect(database_compte.nom).to eq(@compte.nom)
  end

  it "peut changer de solde" do
    # p Comptes::Compte.all

    # ajout = 1250
    # expect {
    #   @compte.solde += ajout
    #   expect(@compte).to be_valid
    #   expect(@compte.save).to be_true
    # }.to change{ @compte.solde }.by(ajout)

    # p Comptes::Compte.all

    # database_compte = Comptes::Compte.find(@compte.id)
    # expect(database_compte.solde).to eq(@compte.solde)
  end

end