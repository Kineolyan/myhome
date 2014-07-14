require 'rails_helper'

RSpec.describe "comptes/categories/new", :type => :view do
  before(:each) do
    assign(:comptes_categorie, Comptes::Categorie.new(
      :nom => "MyString"
    ))
  end

  it "renders new comptes_categorie form" do
    render

    assert_select "form[action=?][method=?]", comptes_categories_path, "post" do

      assert_select "input#comptes_categorie_nom[name=?]", "comptes_categorie[nom]"
    end
  end
end
