require 'spec_helper'

describe Comptes::TransactionsController do

  context "when POSTing a valid transaction" do

    before(:all) do
      DatabaseCleaner.clean

      @compte = Comptes::Compte.create(nom: 'Super compte', solde: 100)
    end

    before(:each) do
      @transaction = { titre: "un titre", somme: 12.45, compte_id: @compte.id, type_paiement: Comptes::Transaction::TypePaiement.COMPTANT }
      @operation_date = { year: 2013, month: 11, day: 21}
    end

    def post_transaction format = "json"
      post :create, format: format, comptes_transaction: @transaction, operation_date: @operation_date
    end

    def get_json_response
      @json_response = JSON.parse(response.body, symbolize_names: true)
    end

    it "returns a JSON with the transaction description" do
      post_transaction

      get_json_response
      # display errors if any to help
      if @json_response.has_key? :errors
        @json_response[:errors].each { |field, message| puts "#{field} -> #{message}" }
      end
      expect(@json_response).to have_key(:transaction)

      post_created = @json_response[:transaction]
      expect(post_created).not_to be_nil
      expect(post_created).to have_key(:id)

      expect(post_created[:titre]).to eq(@transaction[:titre])
      expect(post_created[:somme]).to eq(@transaction[:somme])
      expect(post_created[:compte]).to eq(@compte.nom)
      expect(post_created[:paiement]).to eq(Comptes::Transaction::TypePaiement.value_of(@transaction[:type_paiement]).name)
      expect(post_created[:date]).to eq("#{@operation_date[:day]}/#{@operation_date[:month]}/#{@operation_date[:year]}")
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
      expect(transaction.type_paiement).to eq(@transaction[:type_paiement])
      expect(Date.new(@operation_date[:year], @operation_date[:month], @operation_date[:day]) === transaction.jour).to be_true
    end

    it "fait varier le solde du compte associé" do
      expect {
        post_transaction
      }.to change{ Comptes::Compte.find(@compte.id).solde }.by(@transaction[:somme] * 100)
    end

    it "refuse une transaction sans titre", todo: true do
      # enlève le nom de la transaction
      @transaction[:titre] = ""

      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      expect(@json_response[:errors]).to have_at_least(1).items
    end

    it "refuse une transaction sans somme", todo: true do
      # enlève la somme de la transaction
      @transaction[:somme] = nil

      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      expect(@json_response[:errors]).to have_at_least(1).items
    end

    it "refuse une transaction avec une somme non décimale", todo: true do
      # enlève la somme de la transaction
      @transaction[:somme] = "abcde"

      post_transaction
      get_json_response

      expect(@json_response).to have_key :errors
      expect(@json_response[:errors]).to have_at_least(1).items
    end

  end

end