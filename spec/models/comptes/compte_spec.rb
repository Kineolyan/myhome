require 'spec_helper'

describe Comptes::Compte do

  before(:each) do
    DatabaseCleaner.clean
  end

  let(:compte) { FactoryGirl.build :comptes_compte }
  subject { compte }

  it { is_expected.to be_valid }

  it 'has no validation' do
    expect(compte.validation_date).to be_nil
    expect(compte.validation_solde).to be_nil
    expect(compte.validated_date).to be_nil
  end

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

    it "gets the raw solde" do
      expect(compte_test.solde raw: true).to eq 450
    end
  end

  describe "#solde_formatte" do
    before { compte.save! }

    specify { expect(compte.solde_formatte).to eq "%.2f €" % [compte.solde]}
    specify { expect(compte.solde_formatte false).to eq "%.2f" % [compte.solde]}
  end

  describe "#validate" do
    before do
      compte.save!
      compte.validate
    end

    it 'records the current date as validation time' do
      expect(compte.validation_date).to be_within(10).of(Time.now)
    end

    it 'records the current date as validation point' do
      expect(compte.validated_date).to be_within(10).of(Time.now)
    end

    it 'records the solde at validation time' do
      expect(Comptes::ComptesHelper.decode_amount compte.validation_solde).to eq compte.solde
    end

    it 'supports various validations' do
      FactoryGirl.create :comptes_transaction, compte: compte, somme: 500, jour: 3.months.ago
      expect {
        compte.validate
      }.to change { compte.validation_solde }.by 500

      expect(compte.validation_date).to be_within(10).of(Time.now)
    end

    describe "with validation date as parameter" do
      before do
        FactoryGirl.create :comptes_transaction, compte: compte, somme: 5_00, jour: 3.months.ago
        FactoryGirl.create :comptes_transaction, compte: compte, somme: 10_00, jour: 1.months.ago
        compte.validate 2.months.ago
      end

      it "records the given date as validation point" do
        expect(compte.validated_date).to be_within(10).of 2.months.ago
      end

      it 'records the current date as validation time' do
        expect(compte.validation_date).to be_within(10).of(Time.now)
      end

      it "records the solde at the given date" do
        expect(compte.validation_solde).to eq 18_70
      end
    end
  end

  describe "#unvalidated_transactions" do
    before do
      compte.save!
      compte.validate
    end

    it 'detects basic transactions' do
      transaction = FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: 3.months.ago
      expect(compte.unvalidated_transactions).to eq [ transaction ]
    end

    it 'detects monnaie transactions' do
      transaction = FactoryGirl.create :comptes_transaction_monnaie, compte: compte, somme: 200, jour: Date.today
      expect(compte.unvalidated_transactions).to eq [ transaction ]
    end

    it 'detects future transactions' do
      transaction = FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: (Date.today >> 1)
      expect(compte.unvalidated_transactions).to eq [ transaction ]
    end

    it 'detects updated transactions' do
      updated_transaction = FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: 3.months.ago
      compte.validate

      updated_transaction.update! somme: 1000
      expect(compte.unvalidated_transactions).to eq [ updated_transaction ]
    end

    describe "with validation date != validated date" do
      let(:recent_transaction) { FactoryGirl.create :comptes_transaction, compte: compte, somme: 10_00, jour: 1.months.ago }
      before do
        FactoryGirl.create :comptes_transaction, compte: compte, somme: 5_00, jour: 3.months.ago
        compte.validate 2.months.ago
      end

      it "records the solde at the given date" do
        expect(compte.unvalidated_transactions).to eq [ recent_transaction ]
      end
    end
  end

end