module Comptes

  class TransactionsController < ApplicationController

    def index
      @transactions = Transaction.order(jour: :desc, updated_at: :desc)
      if params.key? :compte_id
        @transactions.where!(compte_id: params[:compte_id])
      end
    end

    def ajouter
      @compte_selectionne = Comptes::Compte.find_by_id params[:compte_id]
    end

    # def new
    # end

    def create
      parameters = format_params(transaction_params)

      @transaction = Transaction.new parameters

      if @transaction.save
        respond_to do |format|
          format.html { redirect_to @transaction }
          format.json do
            render json: { transaction: {
              id: @transaction.id,
              titre: @transaction.titre,
              somme: @transaction.somme.to_f / 100,
              compte: @transaction.compte.nom,
              date: @transaction.jour_formatte,
              paiement: @transaction.paiement
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
          format.html { render :update }
        end
      end

      parameters = format_params transaction_params
      if @transaction.update parameters
        respond_to do |format|
          format.html { render :show }
        end
      else
        respond_to do |format|
          format.html { render :update }
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
      params.require(:comptes_transaction).permit(:titre, :somme, :jour, :compte_id, :type_paiement)
    end

    # Formate les parametres de la transaction
    # * convertit la somme en centimes
    def format_params parameters
      somme = parameters[:somme]
      parameters[:somme] = (somme.to_f * 100).to_i if ApplicationHelper::is_a_number? somme

      parameters
    end

  end

end
