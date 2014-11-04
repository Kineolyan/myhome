require 'spec_helper'

RSpec.describe Comptes::ComptesController, type: :controller do

  before(:each) do
    DatabaseCleaner.clean
  end

  describe "Creation d'un compte" do

    it "crée un compte" do
      post :create, comptes_compte: { nom: "Compte test", solde_historique: 120 }

      created_compte = Comptes::Compte.find_by_nom "Compte test"
      expect(created_compte).not_to be_nil

      expect(created_compte.solde_historique).to eq 120_00
    end

  end

  describe "#solde" do
    let(:compte) { FactoryGirl.create :comptes_compte}

    describe "with invalid date" do
      describe "as POST" do
        describe "in html" do
          before { post :solde, id: compte.id, date: "abcde" }
          subject { response }

          it { is_expected.to be_success }
        end

        describe "in Ajax" do
          before { xhr :post, :solde, id: compte.id, date: "abcde" }
          subject { response }

          it { is_expected.to be_success }
        end
      end
    end
  end

  describe "#statistics" do
    let(:compte) { FactoryGirl.create :comptes_compte }
    let(:categories) { Array.new(3) { |i| FactoryGirl.create :comptes_category, nom: "Category-#{i + 1}" } }

    before(:each) do
      t1 = FactoryGirl.create :comptes_transaction, compte: compte, somme: 1000, jour: Date.today
      t1.categories << categories.first
      t1.save!

      t2 = FactoryGirl.create :comptes_transaction, compte: compte, somme: -1300, jour: Date.today
      t2.categories << categories.last
      t2.save!
    end

    describe "JSON request" do
      def post_request parameters = {}
        parameters[:format] = :json
        JSON.parse post(:statistics, parameters).body
      end

      def month_for date
        date.strftime "%Y-%m"
      end

      describe "with account" do
        describe "on period with transactions" do
          subject { post_request id: compte.id, month: month_for(Date.today) }

          it "has all categories" do
            expect(subject.keys).to match_array Comptes::Category.all.collect { |c| c.nom }
          end

          it { is_expected.to include(categories.first.nom => 10.0) }
          it { is_expected.to include(categories.last.nom => -13.0) }

          it "have 0 for all categories" do
            Comptes::Category.all.each do |category|
              next if categories.include? category

              expect(expenses).to include(category.nom => 0)
            end
          end
          it { is_expected.to have_key categories.first.nom }
        end

        describe "out of transactions" do
          let(:expenses) { post_request id: compte.id, month: month_for(3.months.ago) }

          it "has all categories" do
            expect(expenses.keys).to match_array Comptes::Category.all.collect { |c| c.nom }
          end

          it "have 0 for all categories" do
            Comptes::Category.all.each do |category|
              expect(expenses).to include(category.nom => 0)
            end
          end
        end
      end

      describe "without account" do
        let(:expenses) { post_request id: -1, month: month_for(Date.today) }

        it "returns empty hash" do
          expect(expenses).to be_empty
        end
      end
    end
  end

end
