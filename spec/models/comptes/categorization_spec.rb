require 'rails_helper'

RSpec.describe Comptes::Categorization, :type => :model do

  before(:each) do
    DatabaseCleaner.clean
  end

  context "#create" do
    let(:transaction) { Comptes::Transaction.new titre: "Transaction test", somme: 123, jour: Date.today, compte: Comptes::Compte.new(nom: "compte test", solde_historique: 1234) }
    let(:categorie) { Comptes::Categorie.new nom: "categorie test" }

    it "fonctionne avec tous les éléments" do
      expect(Comptes::Categorization.new transaction: transaction, categorie: categorie).to be_valid
    end

    it "fails sans transaction" do
      expect(Comptes::Categorization.new categorie: categorie).not_to be_valid
    end

    it "fails sans categorie" do
      expect(Comptes::Categorization.new transaction: transaction).not_to be_valid
    end
  end

end
