require "spec_helper.rb"

RSpec.describe Comptes::ComptesHelper do

  describe "Formatter de somme" do

    it "convertit correctement pour le stockage" do
      expect(Comptes::ComptesHelper.encode_amount 145.8).to eq 14580
      expect(Comptes::ComptesHelper.encode_amount 987).to eq 98700
      expect(Comptes::ComptesHelper.encode_amount -4.56).to eq -456


      expect(Comptes::ComptesHelper.encode_amount "12.34").to eq 1234
      expect(Comptes::ComptesHelper.encode_amount "-54.37").to eq -5437
    end

    it "gères les problènes de mantisse" do
      expect(Comptes::ComptesHelper.encode_amount "-81.24").to eq -8124
    end

    it "convertit correctement depuis la valeur stockée" do
      expect(Comptes::ComptesHelper.decode_amount 14580).to eq 145.8
      expect(Comptes::ComptesHelper.decode_amount 14500).to eq 145
      expect(Comptes::ComptesHelper.decode_amount -456).to eq -4.56


      expect(Comptes::ComptesHelper.decode_amount "1234").to eq 12.34
      expect(Comptes::ComptesHelper.decode_amount "-5437").to eq -54.37
    end
  end
end