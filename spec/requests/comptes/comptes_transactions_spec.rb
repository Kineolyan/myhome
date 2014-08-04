RSpec.describe "Transactions", type: :request do
	let!(:compte) { FactoryGirl.create :comptes_compte }
	let!(:category1) { FactoryGirl.create :comptes_category, nom: "category1" }

	subject { page }

	def fill_form transaction
		fill_in "Titre", with: transaction.titre
		fill_in "Somme", with: (transaction.somme.to_f / 100).to_s
		fill_in "Date", with: transaction.jour
		select Comptes::TransactionsController::Types.from_class(transaction).name, from: "Type de transaction"
		select category1.nom, from: "Catégories"
	end

	def submit_form
		click_button "Ajouter l'opération"
	end

	def enter_transaction transaction
		fill_form transaction
		submit_form
	end

	describe "/comptes/:compte_id/transactions/ajouter" do
		describe "without JavaScript" do
			let(:transaction) { FactoryGirl.build :comptes_transaction, compte: compte, somme: 1234 }
			before do
				visit ajouter_comptes_compte_transactions_path compte
				fill_form transaction
			end

			specify {	expect { submit_form }.to change { Comptes::Transaction.count }.by 1 }

			describe "create transaction" do
				before { submit_form }

				it { is_expected.to have_content transaction.titre }
				it { is_expected.to have_content "Catégories: #{category1.nom}" }
			end
		end
	end

end