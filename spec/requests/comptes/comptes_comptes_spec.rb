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
		let(:compte) { FactoryGirl.create :comptes_compte_with_transactions }

		before { visit solde_comptes_compte_path compte }

		it { is_expected.to respond }
	end

end
