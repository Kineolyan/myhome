RSpec.describe "Transactions", type: :request do
	let!(:compte) { FactoryGirl.create :comptes_compte }
	let!(:category1) { FactoryGirl.create :comptes_category, nom: "category1" }

	subject { page }

	def fill_form transaction
		fill_in "Titre", with: transaction.titre
		fill_in "Somme", with: (transaction.somme.abs.to_f / 100).to_s
		fill_in "Date", with: transaction.jour
		select Comptes::TransactionsController::Types.from_class(transaction).name, from: "Type de transaction"
		select category1.nom, from: "Catégories"
		if transaction.somme > 0
			uncheck "comptes_transaction[negative]"
		else
			check "comptes_transaction[negative]"
		end
	end

	def enter_transaction transaction
		fill_form transaction
		submit_form
	end

	def get_created_transaction
		Comptes::Transaction.order(created_at: :desc).first
	end

	describe "/comptes/:compte_id/transactions/ajouter" do
		let(:transaction) { FactoryGirl.build :comptes_transaction, compte: compte, somme: 1234 }
		before do
			visit ajouter_comptes_compte_transactions_path compte
			fill_form transaction
		end

		def submit_form
			click_button "Ajouter l'opération"
		end

		specify {	expect { submit_form }.to change { Comptes::Transaction.count }.by 1 }

		describe "without JavaScript" do
			before { submit_form }

			it { is_expected.to have_content transaction.titre }
			it { is_expected.to have_content "Catégories: #{category1.nom}" }
		end

		pending "working selenium" do
		describe "with JavaScript" do
			before { submit_form }

			it { is_expected.to have_selector ".transaction:first-child", text: transaction.titre }

			describe "with a second operation" do
				let(:transaction2) { FactoryGirl.build :comptes_transaction, compte: compte, titre: 'transaction2' }
				before do
					enter_transaction transaction2
				end

				it { is_expected.to have_selector ".transaction:first-child", text: transaction2.titre }
				it { is_expected.to have_selector ".transaction:last-child", text: transaction.titre }
			end

			describe "Plus/Minus somme button" do
				describe "when checked" do
					before { check "comptes_transaction[negative]" }

					it { is_expected.to have_checked_field "-" }
				end

				describe "when not checked" do
					before { uncheck "comptes_transaction[negative]" }

					it { is_expected.to have_unchecked_field "+" }
				end
			end
		end
		end # pending

		describe "Plus/Minus somme button" do
			it "is - by default" do
				visit ajouter_comptes_compte_transactions_path compte
			 	expect(page).to have_checked_field "comptes_transaction[negative]"
			end

			describe "when checked" do
				before do
					check "comptes_transaction[negative]"
					submit_form
				end

				specify { expect(get_created_transaction.somme).to eq -1234 }
			end

			describe "when not checked" do
				before do
					uncheck "comptes_transaction[negative]"
					submit_form
				end

				specify { expect(get_created_transaction.somme).to eq 1234 }
			end
		end
	end

	describe "/comptes/transactions/edit/:transaction_id" do
		def submit_form
			click_button "Éditer l'opération"
		end

		let(:transaction) { FactoryGirl.create :comptes_transaction, compte: compte, somme: 1234 }
		let!(:category2) { FactoryGirl.create :comptes_category, nom: "category2" }

		before do
			category1.transactions << transaction
			category1.save!

			visit edit_comptes_transaction_path(transaction)
		end

		describe "add one category" do
			before do
				select category2.nom, from: "Catégories"
				submit_form
			end

			it { is_expected.to have_content "Catégories: #{category1.nom}, #{category2.nom}" }
		end

		describe "remove category" do
			before do
				unselect category1.nom, from: "Catégories"
				submit_form
			end

			it { is_expected.to have_content "Catégories: aucune" }
		end

		describe "changing categories" do
			before do
				unselect category1.nom, from: "Catégories"
				select category2.nom, from: "Catégories"
				submit_form
			end

			it { is_expected.to have_content "Catégories: #{category2.nom}" }
		end

		describe "+/- button" do
			describe "with positive transaction" do
				before do
					transaction = FactoryGirl.create :comptes_transaction, compte: compte, somme: 1234
					visit edit_comptes_transaction_path transaction
				end
				subject { page.find("#transaction-form") }

				it { is_expected.to have_unchecked_field "comptes_transaction[negative]" }
				it { is_expected.to have_field "Somme", with: "12.34" }
			end

			describe "with negative transaction" do
				before do
					transaction = FactoryGirl.create :comptes_transaction, compte: compte, somme: -5678
					visit edit_comptes_transaction_path transaction
				end
				subject { page.find("#transaction-form") }

				it { is_expected.to have_checked_field "comptes_transaction[negative]" }
				it { is_expected.to have_field "Somme", with: "56.78" }
			end
		end
	end

end