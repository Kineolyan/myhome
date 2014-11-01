require 'spec_helper'

describe Comptes::Transaction do

  before(:each) do
    DatabaseCleaner.clean
  end

  describe "#create" do
    let(:transaction) { FactoryGirl.build :comptes_transaction }
    subject { transaction }

    it_behaves_like "a valid model"

    describe "with notes" do
      before { transaction.notes = "quelques notes" }
      it_behaves_like "a valid model"
    end

    describe "without titre" do
      before { transaction.titre = "" }
      it_behaves_like "an invalid model"
    end

    describe "without somme" do
      before { transaction.somme = nil }
      it_behaves_like "an invalid model"
    end

    describe "with an alphabetic somme" do
      before { transaction.somme = "abcde" }
      it_behaves_like "an invalid model"
    end

    describe "without jour" do
      before { transaction.jour = nil }
      it_behaves_like "an invalid model"
    end

    describe "without compte" do
      before { transaction.compte = nil }
      it_behaves_like "an invalid model"
    end

  end

  describe "#somme_formattee" do
    let(:transaction) { FactoryGirl.build :comptes_transaction }

    specify { expect(transaction.somme_formattee).to eq "%.2f €" % [transaction.somme.to_f / 100]}
    specify { expect(transaction.somme_formattee false).to eq "%.2f" % [transaction.somme.to_f / 100]}
  end

  describe "effects on compte" do
    let!(:compte) { FactoryGirl.create :comptes_compte }
    let!(:initial_solde) { compte.solde }
    let(:transaction) { FactoryGirl.build :comptes_transaction, compte: compte }

    subject { compte }

    describe "change compte solde" do

      it "does not affect before save" do
        expect(subject).to have_solde initial_solde
      end

      describe "by 0" do
        before do
          transaction.somme = 0
          transaction.save
        end

        it { is_expected.to have_solde initial_solde }
      end

      describe "by a positive somme" do
        before do
          transaction.somme = 1200
          transaction.save
        end

        it { is_expected.to have_solde initial_solde + 12 }
      end

      describe "by a negative somme" do
        before do
          transaction.somme = -180
          transaction.save
        end

        it { is_expected.to have_solde initial_solde - 1.8 }
      end

    end

    describe "on transaction destruction" do
      before do
        transaction.save
        transaction.destroy
      end

      it { is_expected.to have_solde initial_solde }
    end

  end

  describe "categories" do
    let!(:category_1) { FactoryGirl.create :comptes_category, nom: "category_1" }
    let!(:category_2) { FactoryGirl.create :comptes_category, nom: "category_2" }

    describe 'at creation' do
      let(:transaction) { FactoryGirl.build :comptes_transaction }
      subject { transaction }

      pending "until an implementation is found" do
        describe "through #new" do
          let(:particular_transaction) { FactoryGirl.build :comptes_transaction, categorizations_attributes: [ { category_id: category_1.id } ] }
          subject { particular_transaction }

          it_behaves_like "a valid model"
        end

        describe "through #categories#<<" do
          before { transaction.categories << category_1 }

          it_behaves_like "a valid model"
        end

        describe "utilise #categorizations#build" do
          before { transaction.categorizations.build category: category_1 }

          it_behaves_like "a valid model"
        end
      end
    end

    describe "at update" do
      let(:transaction) { FactoryGirl.create :comptes_transaction }

      before do
        transaction.categories << category_1
        transaction.save
      end

      specify { expect(transaction.categories).to include category_1 }
    end

  end

  describe "#before" do
    let(:compte) { FactoryGirl.create :comptes_compte }
    let!(:transaction1) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: 3.months.ago }
    let!(:transaction2) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -300, jour: 2.months.ago }
    let!(:transaction3) { FactoryGirl.create :comptes_transaction, compte: compte, somme: 250, jour: 1.month.ago }

    specify { expect(Comptes::Transaction.before(2.months.ago - 5.day)).to eq [ transaction1 ] }
    specify { expect(Comptes::Transaction.before(2.months.ago)).to eq [ transaction1 ] }
    specify { expect(Comptes::Transaction.before(2.months.ago + 5.day)).to eq [ transaction1, transaction2 ] }
  end

  describe "#after" do
    let(:compte) { FactoryGirl.create :comptes_compte }
    let!(:transaction1) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: 3.months.ago }
    let!(:transaction2) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -300, jour: 2.months.ago }
    let!(:transaction3) { FactoryGirl.create :comptes_transaction, compte: compte, somme: 250, jour: 1.month.ago }

    specify { expect(Comptes::Transaction.after(2.months.ago - 5.day)).to eq [ transaction2, transaction3 ] }
    specify { expect(Comptes::Transaction.after(2.months.ago)).to eq [ transaction3 ] }
    specify { expect(Comptes::Transaction.after(2.months.ago + 5.day)).to eq [ transaction3 ] }
  end

  describe "#until" do
    let(:compte) { FactoryGirl.create :comptes_compte }
    let!(:transaction1) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: 3.months.ago }
    let!(:transaction2) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -300, jour: 2.months.ago }
    let!(:transaction3) { FactoryGirl.create :comptes_transaction, compte: compte, somme: 250, jour: 1.month.ago }

    specify { expect(Comptes::Transaction.until(2.months.ago - 5.day)).to eq [  transaction1 ] }
    specify { expect(Comptes::Transaction.until(2.months.ago)).to eq [ transaction1, transaction2 ] }
    specify { expect(Comptes::Transaction.until(2.months.ago + 5.day)).to eq [ transaction1, transaction2 ] }
  end

  describe "#since" do
    let(:compte) { FactoryGirl.create :comptes_compte }
    let!(:transaction1) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -500, jour: 3.months.ago }
    let!(:transaction2) { FactoryGirl.create :comptes_transaction, compte: compte, somme: -300, jour: 2.months.ago }
    let!(:transaction3) { FactoryGirl.create :comptes_transaction, compte: compte, somme: 250, jour: 1.month.ago }

    specify { expect(Comptes::Transaction.since(2.months.ago - 5.day)).to eq [ transaction2, transaction3 ] }
    specify { expect(Comptes::Transaction.since(2.months.ago)).to eq [ transaction2, transaction3 ] }
    specify { expect(Comptes::Transaction.since(2.months.ago + 5.day)).to eq [ transaction3 ] }
  end

  describe "#of_account" do
    let(:compte1) { FactoryGirl.create :comptes_compte, nom: "Compte 1" }
    let(:compte2) { FactoryGirl.create :comptes_compte, nom: "Compte 2" }
    let!(:transaction1) { FactoryGirl.create :comptes_transaction, compte: compte1, somme: -500, jour: 3.months.ago }
    let!(:transaction2) { FactoryGirl.create :comptes_transaction, compte: compte2, somme: -300, jour: 2.months.ago }

    specify { expect(Comptes::Transaction.all).to eq [ transaction1, transaction2 ] }
    specify { expect(Comptes::Transaction.of_account(compte1)).to eq [ transaction1 ] }
  end

end