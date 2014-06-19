require 'spec_helper'

RSpec.describe Comptes::ComptesController, :type => :controller do

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

end
