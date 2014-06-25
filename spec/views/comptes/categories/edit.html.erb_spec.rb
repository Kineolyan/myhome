require 'rails_helper'

RSpec.describe "comptes/categories/edit", :type => :view do
  before(:each) do
    @comptes_categorie = assign(:comptes_categorie, Comptes::Categorie.create!(
      :nom => "MyString"
    ))
  end

  it "renders the edit comptes_categorie form" do
    render

    assert_select "form[action=?][method=?]", comptes_categorie_path(@comptes_categorie), "post" do

      assert_select "input#comptes_categorie_nom[name=?]", "comptes_categorie[nom]"
    end
  end
end
