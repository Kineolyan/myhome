require 'test_helper'

module Comptes

  class CompteTest < ActiveSupport::TestCase
    test "can create a Compte" do
      compte = creer_compte
      assert compte.save, "Compte créé"
    end

    test "cannot create a Compte without name" do
      compte = Compte.new solde: 100
      assert !compte.save, "Compte créé sans nom"
    end

    test "cannot create a Compte without a solde" do
      compte = Compte.new nom: "Compte de chouchou"
      assert !compte.save, "Compte créé sans solde"
    end

    test "cannot create a Compte without a integral solde" do
      compte = Compte.new nom: "Mon compte", solde: "abcde"
      assert !compte.save, "Compte créé avec un solde alphabétique"
    end

    test "cannot create a Compte with an existing name" do
      compte = creer_compte
      assert compte.save, "Premier compte créé"

      compte_deux = creer_compte
      assert !compte_deux.save, "Second compte identique créé"
    end

    private
    def creer_compte
      Compte.new nom: "Compte de chouchou", solde: 100
    end
  end

end # module Comptes