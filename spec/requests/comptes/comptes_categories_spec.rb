require 'rails_helper'

RSpec.describe "Comptes::Categories", :type => :request do
  describe "GET /comptes_categories" do
    it "works! (now write some real specs)" do
      get comptes_categories_path
      expect(response.status).to be(200)
    end
  end
end
