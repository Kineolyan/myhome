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
			previous_month = Date.new(today.year, today.month, 15) << 1
			3.times { |i| FactoryGirl.create :comptes_transaction, compte: compte, somme: (1500 * (i % 2 - 1)), jour: (previous_month << i) }

			visit summary_comptes_compte_path compte
		end

		it { is_expected.to respond }

		describe "table of evolution" do
			def it_has_row_with index, month, solde, total, evolution
				row = subject.find("tbody tr:nth-child(#{index})")

				specify { expect(row.find("td:nth-child(0)")).to be month.month }
				specify { expect(row.find("td:nth-child(1)")).to be solde }
				specify { expect(row.find("td:nth-child(2)")).to be total }
				specify { expect(row.find("td:nth-child(3)")).to be evolution }
			end

			subject { page.find('#evolution-table') }

			it { is_expected.to have_css "tbody tr", count: 12 }
			# it_has_row_with 0,
		end
	end

end
