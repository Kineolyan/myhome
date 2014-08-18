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

  describe "#solde" do
    let!(:compte_test) { FactoryGirl.create :comptes_compte, solde_historique: 1000 }
    before do
      FactoryGirl.create :comptes_transaction, compte: compte_test, somme: -500, jour: 3.months.ago # 500
      FactoryGirl.create :comptes_transaction, compte: compte_test, somme: -300, jour: 2.months.ago # 200
      FactoryGirl.create :comptes_transaction, compte: compte_test, somme: 250, jour: 1.month.ago # 450
    end

    it "donne le solde total" do
      expect(compte_test.solde).to be_within(0.01).of(4.5)
    end

    it "donne le solde jusqu'a une date limite" do
      expect(compte_test.solde(until: 2.months.ago)).to be_within(0.01).of(2)
    end

    it "formatte le solde" do
      expect(compte_test.solde with_currency: true).to eq "4.50 €"
    end
  end

  describe "#solde_formatte" do
    before { compte.save! }

    specify { expect(compte.solde_formatte).to eq "%.2f €" % [compte.solde]}
    specify { expect(compte.solde_formatte false).to eq "%.2f" % [compte.solde]}
  end

end