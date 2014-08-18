require 'rails_helper'

RSpec.describe "Comptes::Categories", :type => :request do
	let!(:categorie) { FactoryGirl.create :comptes_category }

	subject { page }

	describe "/comptes/categories" do
	end

	describe "/comptes/categories/show" do
		before { visit comptes_category_path categorie }

		it { is_expected.to have_selector "#title", text: "Catégorie #{categorie.nom}" }
	end

	describe "/comptes/categories/new" do
		before { visit new_comptes_category_path }

		it { is_expected.to have_selector "#title", text: "Nouvelle catégorie" }

		describe "on errors" do
			before do
				fill_in "Nom", with: ""
				click_button "Créer la catégorie"
			end

			it { is_expected.to have_selector "#error_explanations" }
		end
	end

	describe "/comptes/categories/edit" do
		before { visit edit_comptes_category_path categorie }

		it { is_expected.to have_selector "#title", text: "Édition de #{categorie.nom}" }
		it { is_expected.to have_link "Voir", href: comptes_category_path(categorie) }
	end

end
