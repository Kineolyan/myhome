require 'spec_helper'

describe Comptes::TransactionsController do

  context "when POSTing a valid transaction" do

    before(:all) do
      DatabaseCleaner.clean

      @compte = Comptes::Compte.create(nom: 'Super compte', solde: 100)
      @transaction = { titre: "un titre", somme: 1000, compte_id: @compte.id }
      @operation_date = { year: 2013, month: 11, day: 21}
    end

    def post_transaction format = "json"
      post :create, format: format, comptes_transaction: @transaction, operation_date: @operation_date
    end

    it "returns a JSON with the transaction description" do
      post_transaction

      json_response = JSON.parse(response.body, symbolize_names: true)
      # display errors if any to help
      if json_response.has_key? :errors
        json_response[:errors].each { |field, message| puts "#{field} -> #{message}" }
      end
      expect(json_response).to have_key(:transaction)

      post_created = json_response[:transaction]
      expect(post_created).not_to be_nil
      expect(post_created).to have_key(:id)

      expect(post_created[:titre]).to eq(@transaction[:titre])
      expect(post_created[:somme]).to eq(@transaction[:somme])
      expect(post_created[:compte]).to eq(@compte.nom)
      expect(post_created[:date]).to eq("#{@operation_date[:day]}/#{@operation_date[:month]}/#{@operation_date[:year]}")
    end

    it "creates a new transaction" do
      expect {
        post_transaction
      }.to change{ Comptes::Transaction.count }.by(1)
    end

    it "creates a new transaction with all information" do
      post_transaction

      post_created = JSON.parse(response.body, symbolize_names: true)[:transaction]
      expect(post_created).not_to be_nil
      transaction = Comptes::Transaction.find post_created[:id]

      expect(transaction.titre).to eq(@transaction[:titre])
      expect(transaction.somme).to eq(@transaction[:somme])
      expect(transaction.compte.id).to eq(@compte.id)
      expect(Date.new(@operation_date[:year], @operation_date[:month], @operation_date[:day]) === transaction.jour).to be_true
    end

  end

end