require 'spec_helper'

RSpec.describe Comptes::Category, :type => :model do

  before(:each) do
    DatabaseCleaner.clean
  end

  context "#create" do
    let(:category) { FactoryGirl.build :comptes_category }
    subject { category }

    it_behaves_like "a valid model"

    describe "without nom" do
      before { category.nom = "" }

      it_behaves_like "an invalid model"
    end

    describe "without duplication on nom" do
      before { FactoryGirl.create :comptes_category, nom: category.nom }

      it_behaves_like "an invalid model"
    end
  end

end
