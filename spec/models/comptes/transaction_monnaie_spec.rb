require 'spec_helper'

describe Comptes::TransactionMonnaie do

  before(:each) do
    DatabaseCleaner.clean
  end

  let!(:compte) { FactoryGirl.create :comptes_compte }

  describe "#create" do
    let(:transaction) { FactoryGirl.build :comptes_transaction_monnaie, compte: compte }

    it "le montant du compte ne change pas" do
      expect {
        transaction.save
      }.not_to change{ compte.solde }
    end

  end

  describe "#destroy" do
    let(:transaction) { FactoryGirl.create :comptes_transaction_monnaie, compte: compte }

    it "ne change pas le montant du compte" do
      expect {
        transaction.destroy
      }.not_to change{ compte.solde }
    end

  end

end