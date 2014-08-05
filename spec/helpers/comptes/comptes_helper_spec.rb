require "spec_helper.rb"

RSpec.describe Comptes::ComptesHelper do
  let(:helper) { Comptes::ComptesHelper }

  describe "#encode_amount" do
    it "convertit correctement pour le stockage" do
      expect(helper.encode_amount 145.8).to eq 14580
      expect(helper.encode_amount 987).to eq 98700
      expect(helper.encode_amount -4.56).to eq -456


      expect(helper.encode_amount "12.34").to eq 1234
      expect(helper.encode_amount "-54.37").to eq -5437
    end

    it "gères les problènes de mantisse" do
      expect(helper.encode_amount "-81.24").to eq -8124
    end
  end

  describe "#decode_amount" do
    it "convertit correctement depuis la valeur stockée" do
      expect(helper.decode_amount 14580).to be_within(0.01).of 145.8
      expect(helper.decode_amount 14500).to be_within(0.01).of 145
      expect(helper.decode_amount -456).to be_within(0.01).of -4.56


      expect(helper.decode_amount "1234").to be_within(0.01).of 12.34
      expect(helper.decode_amount "-5437").to be_within(0.01).of -54.37
    end
  end

  describe "#format_amount" do
    it "a le bon nombre de décimales" do
      expect(helper.format_amount 12.34).to eq "12.34 €"
      expect(helper.format_amount 4.5).to eq "4.50 €"
      expect(helper.format_amount 6).to eq "6.00 €"

      expect(helper.format_amount -12.34).to eq "-12.34 €"
      expect(helper.format_amount -4.5).to eq "-4.50 €"
      expect(helper.format_amount -6).to eq "-6.00 €"


      expect(helper.format_amount 0.789).to eq "0.79 €"
      expect(helper.format_amount 0.781).to eq "0.78 €"
      expect(helper.format_amount -0.789).to eq "-0.79 €"
      expect(helper.format_amount -0.781).to eq "-0.78 €"
    end

    it "peut enlever le symbole monétaire" do
      expect(helper.format_amount 12.34, false).to eq "12.34"
    end
  end
end