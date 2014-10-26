require 'rails_helper'

RSpec.describe "Transaction Listings", :type => :request do
	subject { page }

	describe "transactions are paginated" do
		let!(:compte) { FactoryGirl.create :comptes_compte }
		before { 30.times { FactoryGirl.create :comptes_transaction, compte: compte } }
		after { compte.destroy }

		describe "in /comptes/transactions" do
			before { visit comptes_transactions_path }

			it_behaves_like "a paginated resource", ".pagination li", [1, 2]
		end

		describe "in /comptes/:comptes_id/transactions" do
			before { visit comptes_compte_transactions_path compte }

			it_behaves_like "a paginated resource", ".pagination li", [1, 2]
		end

		describe "in /comptes/:comptes_id" do
			before { visit comptes_compte_path compte }

			it { is_expected.to have_selector "#transactions-table .transaction", count: 5 }
		end
	end

end
