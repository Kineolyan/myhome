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
      first_category = categories.first
      first_category.transactions << FactoryGirl.create(:comptes_transaction, compte: compte, somme: 1000, jour: Date.today)
      first_category.save!

      last_category = categories.last
      last_category.transactions << FactoryGirl.create(:comptes_transaction, compte: compte, somme: -1300, jour: Date.today)
      last_category.transactions << FactoryGirl.create(:comptes_transaction, compte: compte, somme: 1700, jour: Date.today)
      last_category.save!
    end

    describe "JSON request" do
      def post_request parameters = {}
        parameters[:format] = :json
        JSON.parse(post(:statistics, parameters).body, symbolize_names: false)
      end

      def month_for date
        date.strftime "%Y-%m"
      end

      describe "with account" do
        describe "on period with transactions" do
          let (:statistics) { post_request id: compte.id, month: month_for(Date.today) }
          subject { statistics }

          [ "credit", "debit"].each do |key|
            it { is_expected.to have_key key }
          end

          describe "credit statistics" do
            subject { statistics["credit"] }

            it { is_expected.to include(categories.first.nom => 10.0) }
            it { is_expected.to include(categories.last.nom => 17.0) }

            it "only has 2 categories" do
              expect(subject.size).to be 2
            end
          end

          describe "debit statistics" do
            subject { statistics["debit"] }

            it { is_expected.to include(categories.last.nom => 13.0) }

            it "only has 1 categories" do
              expect(subject.size).to be 1
            end
          end
        end

        describe "out of transactions" do
          subject { post_request id: compte.id, month: month_for(3.months.ago) }

          it "has empty hash of credit" do
            expect(subject["credit"]).to be_empty
          end

          it "has empty hash of debit" do
            expect(subject["debit"]).to be_empty
          end
        end
      end

      describe "without account" do
        subject { post_request id: -1, month: month_for(Date.today) }

        it { is_expected.to be_empty }
      end
    end
  end

  describe "#validate" do
    let(:compte) { FactoryGirl.create :comptes_compte }
    before(:each) do
      FactoryGirl.create(:comptes_transaction, compte: compte, somme: 1000, jour: Date.new(2015, 6, 26))
    end
    subject { Comptes::Compte.find compte.id }

    describe "with a given date" do
      before(:each) do
        post :validate, id: compte.id, date: "2015-7-16"
      end

      it "sets the validation point to the given date" do
        expect(subject.validated_date).to eq Date.new(2015, 7, 16)
      end

      it "sets the validation date to the current time" do
        expect(subject.validation_date).to be_within(10).of Time.now
      end
    end

    describe "without date" do
      before(:each) do
        post :validate, id: compte.id
      end

      it "sets the validation point to the current time" do
        expect(subject.validated_date).to be_within(10).of Time.now
      end

      it "sets the validation date to the current time" do
        expect(subject.validation_date).to be_within(10).of Time.now
      end
    end
  end

end
