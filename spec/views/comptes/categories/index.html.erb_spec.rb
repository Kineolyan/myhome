require 'rails_helper'

RSpec.describe "comptes/categories/index", :type => :view do
  before(:each) do
    assign(:comptes_categories, [
      Comptes::Categorie.create!(
        :nom => "Nom"
      ),
      Comptes::Categorie.create!(
        :nom => "Nom"
      )
    ])
  end

  it "renders a list of comptes/categories" do
    render
    assert_select "tr>td", :text => "Nom".to_s, :count => 2
  end
end
