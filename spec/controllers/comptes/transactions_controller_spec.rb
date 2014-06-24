require 'spec_helper'

RSpec.describe Comptes::TransactionsController, type: :controller do

  Types = Comptes::TransactionsController::Types

  before(:all) do
    DatabaseCleaner.clean

    @compte = Comptes::Compte.create(nom: 'Super compte', solde_historique: 100)
  end

  before(:each) do
    @operation_date = Date.new 2013, 11, 21
    @transaction = { titre: "un titre", somme: 12.45, compte_id: @compte.id, type: Types.DEFAULT.to_i, jour: @operation_date }
  end

  def get_json_response
    @json_response = JSON.parse(response.body, symbolize_names: true)
  end

  def post_transaction format = "json"
    post :create, format: format, comptes_transaction: @transaction
  end

  context "when POSTing a valid transaction" do

    it "returns a JSON with the transaction description" do
      post_transaction

      get_json_response
      # display errors if any to help
      if @json_response.has_key? :errors
        @json_response[:errors].each { |field, message| puts "#{field} -> #{message}" }
      end
      expect(@json_response).not_to have_key :errors

      expect(@json_response).to have_key(:transaction)

      post_created = @json_response[:transaction]
      expect(post_created).not_to be_nil
      expect(post_created).to have_key(:id)

      expect(post_created[:titre]).to eq(@transaction[:titre])
      expect(post_created[:somme]).to eq(@transaction[:somme])
      expect(post_created[:compte]).to eq(@compte.nom)
      expect(post_created[:type]).to match /défaut/i
      expect(post_created[:date]).to eq "#{@operation_date.day}/#{@operation_date.month}/#{@operation_date.year}"
    end

    it "creates a new transaction" do
      expect {
        post_transaction
      }.to change{ Comptes::Transaction.count }.by(1)
    end

    it "creates a new transaction with all information" do
      post_transaction

      post_created = get_json_response()[:transaction]
      expect(post_created).not_to be_nil
      transaction = Comptes::Transaction.find post_created[:id]

      expect(transaction.titre).to eq(@transaction[:titre])
      expect(transaction.somme).to eq(@transaction[:somme] * 100)
      expect(transaction.compte.id).to eq(@compte.id)
      # TODO this may be change to a eq
      expect(@operation_date === transaction.jour).to be true
    end

    it "fait varier le solde du compte associé" do
      solde_precedent = @compte.solde
      post_transaction
      expect(@compte).to have_solde(solde_precedent + @transaction[:somme])
    end

    it "refuse une transaction sans titre" do
      # enlève le nom de la transaction
      @transaction[:titre] = ""

      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      expect(@json_response[:errors]).to have_key :titre
    end

    it "refuse une transaction sans somme" do
      # enlève la somme de la transaction
      @transaction[:somme] = nil

      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      expect(@json_response[:errors]).to have_key :somme
    end

    it "refuse une transaction avec une somme non décimale" do
      # enlève la somme de la transaction
      @transaction[:somme] = "abcde"

      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      expect(@json_response[:errors]).to have_key :somme
    end

  end

  context "on transaction types" do

    it "crée une transaction par défault" do
      @transaction[:type] = Types.DEFAULT.to_i

      post_transaction
      get_json_response

      transaction = @json_response[:transaction]
      expect(transaction[:type]).to match /défaut/i
    end

    it "crée une transaction en monnaie" do
      @transaction[:type] = Types.MONNAIE.to_i

      post_transaction
      get_json_response

      transaction = @json_response[:transaction]
      expect(transaction[:type]).to match /monnaie/i
    end

    it "crée une transaction par carte" do
      @transaction[:type] = Types.CARTE.to_i

      post_transaction
      get_json_response

      transaction = @json_response[:transaction]
      expect(transaction[:type]).to match /carte/i
    end

    it "supporte les valeurs en texte" do
      @transaction[:type] = Types.CARTE.to_i.to_s

      post_transaction
      get_json_response

      transaction = @json_response[:transaction]
      expect(transaction[:type]).to match /carte/i
    end

    it "renvoie une erreur si le type n'existe pas" do
      faux_type = -1
      expect(Types.is_valid? faux_type).to be false

      @transaction[:type] = faux_type
      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      p @json_response
    end

  end

end
