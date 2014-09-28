require "enum_class"

module Comptes

  class TransactionsController < ApplicationController
    Types = EnumClass.create_series [:default, :monnaie, :carte, :virement]
    class << Types
      class Error < RangeError
      end

      def get_class type
        case type
        when Types.MONNAIE
          Comptes::TransactionMonnaie
        when Types.CARTE
          Comptes::TransactionCarte
        when Types.VIREMENT
          Comptes::Transfer
        when Types.DEFAULT
          Comptes::Transaction
        else
          raise Error, "Unknown type #{type}"
        end
      end

      def from_class transaction
        case transaction
        when Comptes::TransactionCarte
          Types.CARTE
        when Comptes::TransactionMonnaie
          Types.MONNAIE
        when Comptes::Transfer
          Types.VIREMENT
        when Comptes::Transaction
          Types.DEFAULT
        else
          raise Error, "Unknown class #{transaction}"
        end
      end
    end

    before_action :get_transaction, only: [:show, :edit, :update]
    before_action :get_context, only: [:index, :summary, :ajouter]
    before_action :get_allowed_resources, only: [:ajouter, :edit, :update]
    before_action :get_formatted_parameters, only: [:create, :update]

    def index
      @transactions = Transaction.all
      @transactions.where!(compte_id: @compte.id) if @compte
      @transactions = @transactions.paginate(page: params[:page], per_page: 20).order(jour: :desc, updated_at: :desc)
    end

    def ajouter
      @transaction = Transaction.new
      @transaction.compte = @compte if @compte
    end

    # def new
    # end

    def create
      if @transaction_type
        transaction_class = Types.get_class @transaction_type
        @transaction = transaction_class.new @parameters
      else
        @transaction = Comptes::Transaction.new
        @transaction.errors.add :type, "Type de transaction inconnu"
      end

      if @transaction.errors.empty? && @transaction.save
        # set the categories (workaround)
        @transaction.categories = @categories
        flash[:error] = "Erreur dans l'assignation des catégories." unless @transaction.save

        respond_to do |format|
          format.html { redirect_to @transaction }
          format.json do
            render json: { transaction: {
              id: @transaction.id,
              titre: @transaction.titre,
              somme: @transaction.somme_formattee,
              compte: @transaction.compte.nom,
              jour: @transaction.jour_formatte,
              type: @transaction.class.type_name,
              categories: @transaction.categories.collect{ |categorie| categorie.nom }.join(', ')
            }}
          end
          format.js {}
        end
      else
        respond_to do |format|
          format.html { render "new" }
          format.json { render json: { errors: @transaction.errors.messages } }
          format.js {}
        end
      end
    end

    def edit
    end

    def show
    end

    def update
      if @transaction
        @transaction.categories = @categories
      end

      if @transaction && @transaction.update(@parameters)
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
      @success = false
      if @transaction
        if @transaction.destroy
          flash[:notice] = "Transaction supprimée avec succés"
          @success = true
        else
          flash[:error] = "Impossible de supprimer la transaction"
        end
      else
        flash[:error] = "Transaction invalide. Aucune suppression."
      end

      respond_to do |format|
        format.html { redirect_to comptes_transactions_path }
        format.js {}
      end
    end

    private
      def get_transaction
        @transaction = Transaction.find_by_id params[:id]
      end

      def get_context
        @compte = Compte.find_by_id params[:compte_id]
      end

      def transaction_params
        params.require(:comptes_transaction).permit(:titre, :somme, :jour, :compte_id, :type, :negative, { categories: [] })
      end

      # Formate les parametres de la transaction
      # * convertit la somme en centimes
      def format_params parameters
        somme = parameters[:somme]
        negative_sign = parameters.delete(:negative).to_i || 0
        if ApplicationHelper::is_a_number? somme
          parameters[:somme] = ComptesHelper.encode_amount(somme) * (negative_sign == 1 ? -1 : 1)
        end

        transaction_type = get_transaction_type(parameters.delete(:type))
        categories = get_categories(parameters.delete(:categories))

        return parameters, transaction_type, categories
      end

      def get_formatted_parameters
        @parameters, @transaction_type, @categories = format_params(transaction_params)
      end

      def get_categories category_ids
        category_ids ||= []

        category_ids.collect{ |id| Category.find_by_id id }.delete_if(&:nil?)
      end

      def get_transaction_type type
        transaction_type = type ? type.to_i : nil
        Types.is_valid?(transaction_type) ? Types.value_of(transaction_type) : nil
      end

      def get_allowed_resources
        @categories = Category.order(nom: :asc)
        @comptes = Compte.order(nom: :asc)
        @types = Comptes::TransactionsController::Types
      end
  end

end
