require 'spec_helper'

describe Comptes::Compte do

  before(:all) do
    DatabaseCleaner.clean
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
    expect(compte.save).to be_true

    compte_deux = creer_compte
    expect(compte_deux).not_to be_valid
  end

end