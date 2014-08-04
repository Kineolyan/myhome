require 'spec_helper'

RSpec.describe Comptes::TransactionsController, type: :controller do

  Types = Comptes::TransactionsController::Types

  let!(:compte) { FactoryGirl.create :comptes_compte, solde_historique: 100 }
  let(:transaction_data) { FactoryGirl.build :comptes_transaction, compte: compte, somme: 1200 } # => 12.00

  context "when POSTing transaction (JSON)" do
    let(:transaction_params) { {
      titre: transaction_data.titre,
      somme: transaction_data.somme_formattee(false),
      jour: transaction_data.jour,
      compte_id: transaction_data.compte.id,
      type: transaction_data.class.type_name
    } }

    def get_json_response options = {}
      post_transaction "json"
      json_response = JSON.parse(response.body, symbolize_names: true)

      # display errors if any to help
      if json_response.has_key?(:errors) && options[:show_errors]
        json_response[:errors].each { |field, message| puts "#{field} -> #{message}" }
      end

      json_response
    end

    def post_transaction format = "json"
      post :create, format: format, comptes_transaction: transaction_params
    end

    RSpec.shared_examples "an invalid transaction" do |error_field|
      it { is_expected.not_to have_key :transaction }
      it { is_expected.to have_key :errors }
      specify { expect(subject[:errors]).to have_key error_field }
    end

    it "creates a new transaction" do
      expect {
        post_transaction
      }.to change{ Comptes::Transaction.count }.by(1)
    end

    it "fait varier le solde du compte associé" do
      post_transaction
      expect(compte).to have_solde(13)
    end

    describe "response" do
      before { @json_response = get_json_response }

      subject { @json_response }

      it { is_expected.not_to have_key :errors }
      it { is_expected.to have_key :transaction }

      describe "transaction values" do
        subject { @json_response[:transaction] }

        specify { expect(subject).to have_key(:id) }
        specify { expect(subject[:titre]).to eq transaction_params[:titre] }
        specify { expect(subject[:somme]).to eq transaction_data.somme_formattee }
        specify { expect(subject[:compte]).to eq compte.nom }
        specify { expect(subject[:type]).to match /défaut/i }
        specify { expect(subject[:jour]).to eq transaction_data.jour.strftime "%d/%m/%Y" }
      end

      describe "corresponding transaction" do
        let(:transaction) { Comptes::Transaction.find @json_response[:transaction][:id] }
        let(:transaction_json) { @json_response[:transaction] }

        subject { transaction }

        specify { expect(subject.titre).to eq transaction_params[:titre] }
        specify { expect(subject.somme).to eq transaction_data.somme }
        specify { expect(subject.compte.id).to eq transaction_params[:compte_id] }
        # TODO this may be change to a eq
        # specify { expect(subject.jour === transaction.jour).to be true }
        specify { expect(subject.jour).to eq transaction_params[:jour] }
      end
    end

    describe "without titre" do
      before do
        transaction_params.delete :titre
        @json_response = get_json_response
      end

      subject { @json_response }
      it_behaves_like "an invalid transaction", :titre
    end

    describe "without somme" do
      before do
        transaction_params.delete :somme
        @json_response = get_json_response
      end

      subject { @json_response }
      it_behaves_like "an invalid transaction", :somme
    end

    describe "with alphabetic somme" do
      before do
        transaction_params[:somme] = 'abcde'
        @json_response = get_json_response
      end

      subject { @json_response }
      it_behaves_like "an invalid transaction", :somme
    end

    describe "transaction types" do
      Types.each do |type|
        describe "par #{type.name}" do
          @type_name = Types.get_class(type).type_name

          describe "on value" do
            before do
              transaction_params[:type] = type.value
              @json_response = get_json_response
            end

            specify { expect(@json_response[:transaction][:type]).to match /#{@type_name}/i }
          end

          describe "on name" do
            before do
              transaction_params[:type] = type.name
              @json_response = get_json_response
            end

            specify { expect(@json_response[:transaction][:type]).to match /#{@type_name}/i }
          end
        end
      end

      describe "de type inconnu" do
        before do
          transaction_params[:type] = -1
          @json_response = get_json_response
        end

        specify { expect(Types.is_valid? transaction_params[:type]).to be false }
        subject { @json_response }
        it_behaves_like "an invalid transaction", :type
      end

    end
  end

end
