require 'spec_helper'

describe Comptes::Transaction do

  before(:each) do
    DatabaseCleaner.clean

    @compte = Comptes::Compte.new(nom: 'Super compte', solde_historique: 100)
    expect(@compte.save).to be true

    @transaction_attributes = { titre: 'Cadeau', somme: 1500, jour: Date.new(2014, 1, 1), compte: @compte }
  end

  def create_transaction(values = { notes: "C'est pas important" })
    @transaction_attributes.merge! values

    Comptes::Transaction.new @transaction_attributes
  end

  def make_transaction(values = {})
    transaction = create_transaction(values)
    expect(transaction.save).to be true

    transaction
  end

  context "Validation à la création" do

    it 'creates with correct parameters' do
      transaction = create_transaction

      expect(transaction).to be_valid
    end

    it 'is valid without a note' do
      transaction = create_transaction notes: ''

      expect(transaction).to be_valid
    end

    it "n'est pas valide sans titre" do
      @transaction_attributes.delete :titre
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans somme" do
      @transaction_attributes.delete :somme
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide avec une somme alphabétique" do
      transaction = create_transaction somme: 'abcde'

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans date" do
      @transaction_attributes.delete :jour
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

    it "n'est pas valide sans compte" do
      @transaction_attributes.delete :compte
      transaction = Comptes::Transaction.new @transaction_attributes

      expect(transaction).not_to be_valid
    end

  end

  context "Operations a la création" do

    it "fait varier le solde du compte" do
      solde_before_operation = @compte.solde
      make_transaction(somme: 1200)
      expect(@compte).to have_solde(solde_before_operation + 12)

      solde_before_operation = @compte.solde
      make_transaction(somme: -180)
      expect(@compte).to have_solde(solde_before_operation - 1.8)
    end

    it "enregistre les changements de solde" do
      make_transaction(somme: 1200)

      expect(Comptes::Compte.find(@compte.id).solde).to eq(@compte.solde)
    end

    it "ne touche pas le solde du compte sans save" do
      initial_solde = @compte.solde

      transaction = create_transaction(somme: 100)
      expect(@compte).to have_solde(initial_solde)

      transaction.save
      expect(@compte).to have_solde(initial_solde + 1)
    end

  end

  context "Operations à la suppression" do

    it "recrédite le compte après une suppression" do

      transaction, success = make_transaction somme: -1200
      expect(transaction).not_to be_nil

      solde_before_destroy = @compte.solde
      transaction.destroy
      expect(@compte).to have_solde(solde_before_destroy + 12)
    end

  end

  describe "categories", new: true do
    let!(:category_1) { Comptes::Category.create! nom: "category_1" }
    let!(:category_2) { Comptes::Category.create! nom: "category_2" }

    let(:transaction) { Comptes::Transaction.new @transaction_attributes }

    describe 'a la creation' do
      it "categorise a la creation avec attributs" do
        @transaction_attributes[:categorizations_attributes] = [ { category_id: category_1.id } ]
        local_transaction = Comptes::Transaction.new @transaction_attributes

        transaction.valid?
        p transaction.errors.messages
        expect(local_transaction).to be_valid
      end

      it "utilise categories#<<" do
        transaction.categories << category_1

        transaction.valid?
        p transaction.errors.messages
        expect(transaction).to be_valid
      end

      it "utilise categorizations#build" do
        transaction.categorizations.build category: category_1

        transaction.valid?
        p transaction.errors.messages
        expect(transaction).to be_valid
      end
    end

    describe "met a jour" do
      before(:each) do
        transaction.save
        transaction.categories << category_1
        transaction.save
      end

      subject { transaction }
      specify { expect(transaction.categories).to include category_1 }
    end

  end

end