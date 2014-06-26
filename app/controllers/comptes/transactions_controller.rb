require "enum_class"

module Comptes

  class TransactionsController < ApplicationController
    Types = EnumClass.create_series [:default, :monnaie, :carte]
    class << Types
      def get_class type
        case type
        when Types.MONNAIE
          Comptes::TransactionMonnaie
        when Types.CARTE
          Comptes::TransactionCarte
        else
          Comptes::Transaction
        end
      end

      def from_class transaction
        case transaction
        when Comptes::TransactionCarte
          Types.CARTE
        when Comptes::TransactionMonnaie
          Types.MONNAIE
        when Comptes::Transaction
          Types.DEFAULT
        else
          nil
        end
      end
    end

    before_action :get_allowed_resources, only: [:ajouter, :edit, :update]

    @transaction_type = nil

    def index
      @transactions = Transaction.order(jour: :desc, updated_at: :desc)
      if params.key? :compte_id
        @transactions.where!(compte_id: params[:compte_id])
      end
    end

    def ajouter
      @transaction = Transaction.new compte: Comptes::Compte.find_by_id(params[:compte_id])
    end

    # def new
    # end

    def create
      parameters = format_params(transaction_params)

      transaction_class = Types.get_class @transaction_type
      @transaction = transaction_class.new parameters

      has_errors = false
      unless @transaction_type
        @transaction.errors.add :type, "Type de transaction inconnu"
        has_errors = true
      end

      has_errors |= !@transaction.save
      unless has_errors
        respond_to do |format|
          format.html { redirect_to @transaction }
          format.json do
            render json: { transaction: {
              id: @transaction.id,
              titre: @transaction.titre,
              somme: ComptesHelper.decode_amount(@transaction.somme),
              compte: @transaction.compte.nom,
              date: @transaction.jour_formatte,
              type: @transaction.type_name,
              categories: @transaction.categories.collect{ |categorie| categorie.nom }.join(', ')
            }}
          end
          format.js {}
        end
      else
        respond_to do |format|
          format.html { render "new" }
          format.json { render json: { errors: @transaction.errors } }
          format.js {}
        end
      end
    end

    def edit
      @transaction = Transaction.find_by_id params[:id]
    end

    def show
      @transaction = Transaction.find_by_id params[:id]
    end

    def update
      @transaction = Transaction.find_by_id params[:id]

      unless @transaction
        respond_to do |format|
          format.html { render :edit }
        end
      end

      parameters = format_params transaction_params
      @transaction.categories = get_categories parameters.delete(:categories)

      if @transaction.update parameters
        respond_to do |format|
          format.html { render :show }
        end
      else
        respond_to do |format|
          format.html { render :edit }
        end
      end
    end

    def destroy
      @transaction = Comptes::Transaction.find_by_id(params[:id])
      if @transaction
        if @transaction.destroy
          flash[:notice] = "Transaction supprimée avec succés"
        else
          flash[:error] = "Impossible de supprimer la transaction"
        end
      else
        flash[:error] = "Transaction invalide. Aucune suppression."
      end

      redirect_to comptes_transactions_path
    end

    private
    def transaction_params
      params.require(:comptes_transaction).permit(:titre, :somme, :jour, :compte_id, :type, { categories: [] }, { categorizations_attributes: [ :categorie_id ] })
    end

    # Formate les parametres de la transaction
    # * convertit la somme en centimes
    def format_params parameters
      somme = parameters[:somme]
      parameters[:somme] = ComptesHelper.encode_amount somme if ApplicationHelper::is_a_number? somme

      transaction_type = parameters.delete(:type).to_i if parameters[:type]
      @transaction_type = Types.value_of transaction_type if Types.is_valid? transaction_type

      parameters
    end

    def get_categories category_ids
      category_ids ||= []

      category_ids.collect{ |id| Categorie.find_by_id id }.keep_if{ |categorie| categorie }
    end

    def get_allowed_resources
      @categories = Categorie.order(nom: :asc)
      @comptes = Compte.order(nom: :asc)
      @types = Comptes::TransactionsController::Types
    end
  end

end
