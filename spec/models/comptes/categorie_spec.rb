require 'spec_helper'

RSpec.describe Comptes::Categorie, :type => :model do

  before(:each) do
    DatabaseCleaner.clean
  end

  context "#create" do
    it "accepte une catégorie valide" do
      expect(Comptes::Categorie.new nom: "test").to be_valid
    end

    it "refuse une catégorie sans nom" do
      expect(Comptes::Categorie.new).not_to be_valid
    end

    it "refuse une catégorie dupliquée" do
      nom_categorie = "ma categorie"
      categorie = Comptes::Categorie.new nom: nom_categorie
      categorie.save

      expect(Comptes::Categorie.new nom: nom_categorie).not_to be_valid
    end
  end

end
