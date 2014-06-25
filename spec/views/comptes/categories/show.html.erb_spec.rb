require 'rails_helper'

RSpec.describe "comptes/categories/show", :type => :view do
  before(:each) do
    @comptes_categorie = assign(:comptes_categorie, Comptes::Categorie.create!(
      :nom => "Nom"
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Nom/)
  end
end
