require 'rails_helper'

RSpec.describe Comptes::Categorization, :type => :model do

  before(:each) do
    DatabaseCleaner.clean
  end

  describe "#create" do
    let!(:compte) { Comptes::Compte.create!(nom: "compte test", solde_historique: 1234) }
    let(:transaction) { Comptes::Transaction.create! titre: "Transaction test", somme: 123, jour: Date.today, compte: compte  }
    let!(:categorie) { Comptes::Categorie.create! nom: "categorie test" }
    let(:categorization) { Comptes::Categorization.new transaction: transaction, categorie: categorie }

    subject { categorization }

    it { should be_valid }

    describe "sans transaction" do
      before(:each) { categorization.transaction = nil }

      it { should_not be_valid }
    end

    describe "sans categorie" do
      before(:each) { categorization.categorie = nil }

      it { should_not be_valid }
    end

  end

end
