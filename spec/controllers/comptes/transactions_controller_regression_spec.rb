require 'spec_helper'

RSpec.describe Comptes::TransactionsController, type: :controller do

  context "Float operations" do

    before(:all) do
      DatabaseCleaner.clean

      @compte = Comptes::Compte.create(nom: 'Super compte', solde_historique: 100)
    end

    before(:each) do
      @operation_date = Date.new 2013, 11, 21
      @transaction = { titre: "un titre", somme: 12.45, compte_id: @compte.id, type_paiement: Comptes::Transaction::TypePaiement.COMPTANT.to_i, jour: @operation_date }
    end

    def post_transaction format = "json"
      post :create, format: format, comptes_transaction: @transaction
    end

    def get_json_response
      @json_response = JSON.parse(response.body, symbolize_names: true)
    end

    it "treats correctly -81.24" do
      @transaction[:somme] = "-81.24"
      post_transaction

      get_json_response
      p @json_response
      expect(@json_response).not_to have_key :errors

      post_created = @json_response[:transaction]
      expect(post_created[:somme].to_s).to eq(@transaction[:somme])
    end

  end

end