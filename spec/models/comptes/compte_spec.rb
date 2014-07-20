require 'spec_helper'

describe Comptes::Compte do

  before(:each) do
    DatabaseCleaner.clean
  end

  let(:compte) { FactoryGirl.build :comptes_compte }
  subject { compte }

  it { is_expected.to be_valid }

  describe "without nom" do
    before(:each) { compte.nom = nil }

    it { is_expected.not_to be_valid }
  end

  describe "without solde_historique" do
    before(:each) { compte.solde_historique = nil }

    it { is_expected.not_to be_valid }
  end

  describe "with an alphabetical solde_historique" do
    before(:each) { compte.solde_historique = "abcde" }

    it { is_expected.not_to be_valid }
  end

  describe "avoid duplication on nom" do
    before(:each) { FactoryGirl.create :comptes_compte }

    it { is_expected.not_to be_valid }
  end

  describe "on saved compte" do
    before(:each) { compte.save! }

    it "change of nom" do
      compte.nom = "Nouveau mom du compte"
      expect(compte.save).to be true
    end
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