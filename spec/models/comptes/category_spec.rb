require 'spec_helper'

RSpec.describe Comptes::Category, :type => :model do

  before(:each) do
    DatabaseCleaner.clean
  end

  context "#create" do
    it "accepte une catégorie valide" do
      expect(Comptes::Category.new nom: "test").to be_valid
    end

    it "refuse une catégorie sans nom" do
      expect(Comptes::Category.new).not_to be_valid
    end

    it "refuse une catégorie dupliquée" do
      nom_categorie = "ma categorie"
      categorie = Comptes::Category.new nom: nom_categorie
      categorie.save

      expect(Comptes::Category.new nom: nom_categorie).not_to be_valid
    end
  end

end
