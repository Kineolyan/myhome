require "rails_helper"

RSpec.describe Comptes::CategoriesController, :type => :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/comptes/categories").to route_to("comptes/categories#index")
    end

    it "routes to #new" do
      expect(:get => "/comptes/categories/new").to route_to("comptes/categories#new")
    end

    it "routes to #show" do
      expect(:get => "/comptes/categories/1").to route_to("comptes/categories#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/comptes/categories/1/edit").to route_to("comptes/categories#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/comptes/categories").to route_to("comptes/categories#create")
    end

    it "routes to #update" do
      expect(:put => "/comptes/categories/1").to route_to("comptes/categories#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/comptes/categories/1").to route_to("comptes/categories#destroy", :id => "1")
    end

  end
end
