RSpec.describe "Comptes::ComptesController", :type => :request do

	def submit_date date
		fill_in "Date", with: date
		click_button "Voir le solde"
	end

	def get_solde_entry compte, date
		"Au #{date.strftime "%d/%m/%Y"}: #{compte.solde with_currency: true, until: date}"
	end

	subject { page }

	describe "/comptes/:compte_id" do
		let(:compte) { FactoryGirl.create :comptes_compte_with_transactions }
		before { visit comptes_compte_path compte }

		describe "last transactions" do
			before do
				compte.transactions = Array.new(10) { |index| FactoryGirl.create :comptes_transaction, compte: compte, titre: "t#{index}", jour: (10 - index).days.ago }
				compte.save!

				visit comptes_compte_path compte
			end

			it { is_expected.to have_selector(".transaction", count: 5) }

			describe "has operations from the latest to the oldest" do
				5.times do |i|
					specify { expect(subject.find(".transaction:nth-child(#{i + 1})")).to have_content "t#{10 - (i + 1)}" }
				end
			end
		end
	end

	describe "/comptes/:compte_id/solde" do
		let(:compte) { FactoryGirl.create :comptes_compte_with_transactions }

		before { visit solde_comptes_compte_path compte }

		describe "get solde" do
			let(:first_date) { Date.new(2014, 6, 1) }
			before { submit_date first_date }

			it { is_expected.to have_content get_solde_entry compte, first_date }

			pending "working selenium" do
			describe "get multiple soldes" do
				let(:second_date) { Date.new(2014, 1, 1) }
				before { submit_date second_date }

				it { is_expected.to have_content get_solde_entry compte, first_date }
				it { is_expected.to have_content get_solde_entry compte, second_date }
			end
			end # pending
		end
	end

	describe "/comptes/:compte_id/summary" do
		let(:compte) { FactoryGirl.create :comptes_compte, solde_historique: 100_00 }
		let(:today) { Date.today }

		before do
			previous_middle_month = Date.new(today.year, today.month, 15) << 1
			previous_beginning_month = Date.new(today.year, today.month) << 1

			3.times { |i| FactoryGirl.create :comptes_transaction, compte: compte, somme: (1500 * (i % 2 == 0 ? -1 : 1)), jour: (previous_middle_month << i) }
			FactoryGirl.create :comptes_transaction, compte: compte, somme: -4200, jour: (previous_beginning_month - 1.day)
			FactoryGirl.create :comptes_transaction, compte: compte, somme: 1700, jour: previous_beginning_month
			FactoryGirl.create :comptes_transaction_monnaie, compte: compte, somme: -1000, jour: previous_middle_month

			visit summary_comptes_compte_path compte
		end

		it { is_expected.to respond }

		describe "table of evolution" do
			shared_examples "a row with" do |date, solde, total, credit, debit|
				specify { expect((subject.find :xpath, "./td[1]").text).to eq date.strftime("%B %Y") }
				specify { expect((subject.find :xpath, "./td[2]").text).to eq solde }
				specify { expect((subject.find :xpath, "./td[3]").text).to eq total }
				specify { expect((subject.find :xpath, "./td[4]").text).to eq credit }
				specify { expect((subject.find :xpath, "./td[5]").text).to eq debit }
			end

			subject { page.find('#evolution-table') }

			it { is_expected.to have_css "tbody tr", count: 12 }

			describe "table header" do
				subject { page.find(:xpath, "//table[@id='evolution-table']/thead/tr") }

				specify { expect((subject.find :xpath, "./th[1]").text).to eq "Mois" }
				specify { expect((subject.find :xpath, "./th[2]").text).to eq "Solde en fin de mois" }
				specify { expect((subject.find :xpath, "./th[3]").text).to eq "Total" }
				specify { expect((subject.find :xpath, "./th[4]").text).to eq "Crédit" }
				specify { expect((subject.find :xpath, "./th[5]").text).to eq "Débit" }
			end

			describe "second row" do
				subject { page.find(:xpath, "//table[@id='evolution-table']/tbody/tr[2]") }

				it_behaves_like "a row with", (Date.today << 1), "60.00 €", "2.00 €", "17.00 €", "-15.00 €"
			end

			describe "third row" do
				subject { page.find(:xpath, "//table[@id='evolution-table']/tbody/tr[3]") }

				it_behaves_like "a row with", (Date.today << 2), "58.00 €", "-27.00 €", "15.00 €", "-42.00 €"
			end

			describe "fourth row" do
				subject { page.find(:xpath, "//table[@id='evolution-table']/tbody/tr[4]") }

				it_behaves_like "a row with", (Date.today << 3), "85.00 €", "-15.00 €", "0.00 €", "-15.00 €"
			end
		end
	end

	describe "/comptes/:compte_id/validate" do
		let(:compte) { FactoryGirl.create :comptes_compte, solde_historique: 100_00 }

		before do
			3.times { |i| FactoryGirl.create :comptes_transaction, compte: compte, somme: 10_00, jour: (Date.today - i) }

			visit validate_comptes_compte_path compte
		end

		it { is_expected.to respond }

		describe "without previous validation" do
			it "does not mention anything about validation" do
				expect(subject).not_to have_content "Solde validé"
				expect(subject).not_to have_content "Validé le"
			end
		end

		describe "with previous validation" do
			before do
				compte.validate
				visit validate_comptes_compte_path compte
			end

			it "gives solde at validation" do
				expect(subject).to have_content "Solde validé : 130.00 €"
			end

			it "gives validation date" do
				expect(subject).to have_content "Validé le #{Date.today.strftime("%d/%m/%Y")} à" # cannot set time
			end
		end

		describe "with unvalidated transactions" do
			before do
				compte.validate
				2.times { FactoryGirl.create :comptes_transaction, compte: compte, somme: 20_00, jour: Date.today }

				visit validate_comptes_compte_path compte
			end

			it "displays the validated solde" do
				expect(subject).to have_content "Solde validé : 130.00 €"
			end

			it "displays the current solde" do
				expect(subject).to have_content "Solde actuel : 170.00 €"
			end

			it "displays the difference between validated and current soldes" do
				expect(subject).to have_content "40.00 €"
			end

			it "displays the list of unvalidated transactions" do
				expect(subject).to have_selector "tr.transaction", count: 2
			end
		end

		describe "without unvalidated transactions" do
			before do
				compte.validate
				visit validate_comptes_compte_path compte
			end

			it "does not display the current solde" do
				expect(subject).not_to have_content "Solde actuel"
			end

			it "does not display any transactions" do
				expect(subject).not_to have_selector "tr.transaction"
				expect(subject).to have_content "Aucune transaction depuis la dernière validation"
			end
		end

		describe "after validation" do
			before { page.click_link "", href: validate_comptes_compte_path(compte) }

			it "redirects to the page of the account" do
				expect(page.current_path).to eq comptes_compte_path compte
			end

			it "has validated the account" do
				expect(Comptes::Compte::find(compte.id).validation_date).not_to be_nil
			end
		end
	end
end
